import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { depositions, documentChunks, documents, contradictionFlags } from "@/db";
import { eq } from "drizzle-orm";
import { openai } from "@/lib/openai";

// POST /api/depositions/[id]/summarize — generate post-depo summary
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [depo] = await db
    .select()
    .from(depositions)
    .where(eq(depositions.id, id))
    .limit(1);

  if (!depo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const transcript = depo.transcript as Array<{
    speaker: string;
    text: string;
    start_ms: number;
  }>;

  if (!transcript?.length) {
    return NextResponse.json({ error: "No transcript" }, { status: 400 });
  }

  const transcriptText = transcript
    .map((s) => {
      const totalSec = Math.floor(s.start_ms / 1000);
      const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const sec = String(totalSec % 60).padStart(2, "0");
      return `[${h}:${m}:${sec}] ${s.speaker}: ${s.text}`;
    })
    .join("\n");

  // Fetch case doc chunks
  const chunks = await db
    .select({ content: documentChunks.content, filename: documents.filename })
    .from(documentChunks)
    .innerJoin(documents, eq(documentChunks.documentId, documents.id))
    .where(eq(documentChunks.caseId, depo.caseId))
    .limit(20);

  const docsContext = chunks
    .map((c) => `[${c.filename}]: ${c.content}`)
    .join("\n\n");

  // Fetch flags
  const flags = await db
    .select()
    .from(contradictionFlags)
    .where(eq(contradictionFlags.depositionId, id));

  const flagsText = flags
    .filter((f) => !f.dismissed)
    .map(
      (f, i) =>
        `${i + 1}. Testimony: "${f.testimonyText}" vs Document (${f.sourceDoc}): "${f.conflictingText}"`
    )
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a legal analysis assistant producing a post-deposition summary.",
      },
      {
        role: "user",
        content: `Generate a structured deposition summary as JSON:

Transcript:
${transcriptText}

Case Documents:
${docsContext}

Contradictions Flagged:
${flagsText || "None"}

Output JSON:
{
  "key_admissions": [{ "timestamp": "HH:MM:SS", "text": "..." }],
  "contradictions": [{ "testimony": "...", "document": "...", "source": "..." }],
  "narrative": "..."
}`,
      },
    ],
  });

  const summary = completion.choices[0].message.content?.trim() ?? "";

  await db
    .update(depositions)
    .set({ summary })
    .where(eq(depositions.id, id));

  return NextResponse.json({ summary });
}
