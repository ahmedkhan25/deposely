import { Router, Request, Response } from "express";
import { Webhook } from "svix";
import { neon } from "@neondatabase/serverless";
import OpenAI from "openai";
import { broadcast } from "./clients";

const sql = neon(process.env.DATABASE_URL!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = Router();

// ─── Webhook 1: Status changes (Svix-verified, from Recall dashboard) ────────
// Uses raw body for Svix signature verification
router.post(
  "/webhook/recall",
  (req: Request, res: Response) => {
    const wh = new Webhook(process.env.RECALL_WEBHOOK_SECRET!);
    let msg: { event: string; data: Record<string, unknown> };

    try {
      msg = wh.verify(
        req.body, // raw Buffer from express.raw()
        req.headers as Record<string, string>
      ) as typeof msg;
    } catch {
      console.error("Svix signature verification failed");
      return res.status(400).send("Invalid signature");
    }

    console.log(`[status] event=${msg.event}`);

    if (msg.event === "bot.status_change") {
      handleBotStatusChange(msg.data).catch(console.error);
    }

    res.status(204).send();
  }
);

// ─── Webhook 2: Real-time transcription (token-verified, per-bot) ────────────
// Uses JSON body, secured via query param token
router.post(
  "/webhook/recall/realtime",
  (req: Request, res: Response) => {
    if (req.query.token !== process.env.RECALL_WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    const body = req.body;
    console.log(`[realtime] event=${body.event}`, JSON.stringify(body).slice(0, 200));

    // Handle transcript.data from realtime endpoints
    if (body.event === "transcript.data" || body.event === "bot.transcription") {
      handleTranscription(body.data).catch(console.error);
    }

    res.status(204).send();
  }
);

// ─── Status change handler ───────────────────────────────────────────────────
async function handleBotStatusChange(data: Record<string, unknown>) {
  const botId = data.bot_id as string;
  const status = data.status as string;

  if (!botId) return;

  if (status === "done") {
    // Set deposition status to done
    await sql(`UPDATE depositions SET status = 'done' WHERE recall_bot_id = $1`, [botId]);

    // Get deposition for summary generation
    const rows = await sql(`SELECT id, case_id FROM depositions WHERE recall_bot_id = $1`, [botId]);

    if (rows.length > 0) {
      const depo = rows[0] as { id: string; case_id: string };
      broadcast(depo.id, { type: "done" });
      // Fire and forget: generate post-depo summary
      generateSummary(depo.id, depo.case_id).catch(console.error);
    }
  }
}

// ─── Real-time transcription handler ─────────────────────────────────────────
async function handleTranscription(data: Record<string, unknown>) {
  const botId = (data.bot_id ?? data.bot) as string;
  const transcript = data.transcript as {
    words?: Array<{
      text: string;
      start_ms?: number;
      start_timestamp?: { relative: number };
      speaker?: string;
    }>;
    speaker?: string;
    speaker_id?: number;
    original_transcript_id?: number;
  };

  if (!transcript?.words?.length) return;

  // Reconstruct sentence from words
  const text = transcript.words.map((w) => w.text).join(" ");
  // Speaker can be on individual words or on the transcript object
  const speaker = transcript.words[0].speaker || transcript.speaker || "Unknown";
  // Timestamps can be start_ms (ms) or start_timestamp.relative (seconds)
  const firstWord = transcript.words[0];
  const startMs = firstWord.start_ms ?? Math.round((firstWord.start_timestamp?.relative ?? 0) * 1000);

  const segment = { speaker, text, start_ms: startMs };

  // Find deposition by bot ID
  const rows = await sql(`SELECT id, case_id, transcript FROM depositions WHERE recall_bot_id = $1`, [botId]);

  if (rows.length === 0) {
    console.error(`No deposition found for bot ${botId}`);
    return;
  }

  const depo = rows[0] as {
    id: string;
    case_id: string;
    transcript: Array<{ speaker: string; text: string; start_ms: number }>;
  };

  // Append segment to transcript
  const updatedTranscript = [...(depo.transcript || []), segment];
  await sql(`UPDATE depositions SET transcript = $1, status = 'live' WHERE id = $2`, [JSON.stringify(updatedTranscript), depo.id]);

  // Broadcast to SSE clients
  broadcast(depo.id, { type: "transcript", segment });

  // Fire and forget: contradiction check
  checkContradiction(depo.id, depo.case_id, text).catch(console.error);
}

// ─── Contradiction check ─────────────────────────────────────────────────────
async function checkContradiction(
  depositionId: string,
  caseId: string,
  segmentText: string
) {
  // Embed the segment text
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: segmentText,
  });
  const embedding = embeddingRes.data[0].embedding;
  const embeddingStr = `[${embedding.join(",")}]`;

  // Find top 3 similar document chunks
  const chunks = await sql(
    `SELECT dc.content, d.filename as source_doc, dc.id as chunk_id
     FROM document_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE dc.case_id = $1
     ORDER BY dc.embedding <=> $2
     LIMIT 3`,
    [caseId, embeddingStr]
  );

  if (chunks.length === 0) return;

  const docsContext = (chunks as Array<{ content: string; source_doc: string }>)
    .map((c, i) => `[Doc ${i + 1} - ${c.source_doc}]: ${c.content}`)
    .join("\n\n");

  // Ask GPT-4o to check for contradiction
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a legal analysis assistant. Determine if testimony contradicts provided documents.",
      },
      {
        role: "user",
        content: `Does this testimony contradict the provided documents?

Testimony: "${segmentText}"

Documents:
${docsContext}

Respond ONLY with JSON: { "contradiction": boolean, "explanation": string, "conflicting_text": string }`,
      },
    ],
  });

  const raw = completion.choices[0].message.content?.trim() ?? "{}";
  let result: {
    contradiction: boolean;
    explanation: string;
    conflicting_text: string;
  };
  try {
    result = JSON.parse(raw);
  } catch {
    return;
  }

  if (!result.contradiction) return;

  const sourceDoc = (chunks[0] as { source_doc: string }).source_doc;
  const chunkId = (chunks[0] as { chunk_id: string }).chunk_id;

  // Insert flag into DB
  await sql(
    `INSERT INTO contradiction_flags (deposition_id, testimony_text, conflicting_text, source_doc, chunk_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [depositionId, segmentText, result.conflicting_text, sourceDoc, chunkId]
  );

  // Broadcast flag to SSE clients
  broadcast(depositionId, {
    type: "flag",
    flag: {
      testimonyText: segmentText,
      conflictingText: result.conflicting_text,
      sourceDoc,
      explanation: result.explanation,
    },
  });
}

// ─── Post-deposition summary ─────────────────────────────────────────────────
async function generateSummary(depositionId: string, caseId: string) {
  // Fetch full transcript
  const depoRows = await sql(`SELECT transcript FROM depositions WHERE id = $1`, [depositionId]);
  const transcript = (depoRows[0] as { transcript: Array<{ speaker: string; text: string; start_ms: number }> }).transcript;

  if (!transcript?.length) return;

  const transcriptText = transcript
    .map((s) => `[${formatMs(s.start_ms)}] ${s.speaker}: ${s.text}`)
    .join("\n");

  // Fetch top 20 document chunks for context
  const chunks = await sql(
    `SELECT dc.content, d.filename
     FROM document_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE dc.case_id = $1
     LIMIT 20`,
    [caseId]
  );

  const docsContext = (chunks as Array<{ content: string; filename: string }>)
    .map((c) => `[${c.filename}]: ${c.content}`)
    .join("\n\n");

  // Fetch contradiction flags
  const flags = await sql(
    `SELECT testimony_text, conflicting_text, source_doc
     FROM contradiction_flags
     WHERE deposition_id = $1 AND dismissed = false`,
    [depositionId]
  );

  const flagsText = (flags as Array<{ testimony_text: string; conflicting_text: string; source_doc: string }>)
    .map(
      (f, i) =>
        `${i + 1}. Testimony: "${f.testimony_text}" vs Document (${f.source_doc}): "${f.conflicting_text}"`
    )
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a legal analysis assistant producing a post-deposition summary for an attorney.",
      },
      {
        role: "user",
        content: `Generate a structured deposition summary with these sections:

1. **Key Admissions** — bullet points with timestamps (HH:MM:SS format) of notable admissions or statements
2. **Contradictions Found** — testimony vs document conflicts
3. **Narrative Summary** — 2-3 paragraph overview of the deposition

Transcript:
${transcriptText}

Case Documents:
${docsContext}

Contradictions Flagged:
${flagsText || "None flagged"}

Output as JSON:
{
  "key_admissions": [{ "timestamp": "HH:MM:SS", "text": "..." }],
  "contradictions": [{ "testimony": "...", "document": "...", "source": "..." }],
  "narrative": "..."
}`,
      },
    ],
  });

  const summary = completion.choices[0].message.content?.trim() ?? "";

  await sql(`UPDATE depositions SET summary = $1 WHERE id = $2`, [summary, depositionId]);

  broadcast(depositionId, { type: "summary", summary });
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default router;
