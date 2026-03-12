import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/db";
import { eq } from "drizzle-orm";
import { openai } from "@/lib/openai";

// POST /api/documents/[id]/process — ingest document
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Get document record
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status to processing
    await db
      .update(documents)
      .set({ status: "processing" })
      .where(eq(documents.id, id));

    // Download from S3
    const s3Res = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: doc.s3Key,
      })
    );

    const bodyBytes = await s3Res.Body!.transformToByteArray();
    const buffer = Buffer.from(bodyBytes);

    // Extract text based on file type
    let text: string;
    const ext = doc.filename.toLowerCase().split(".").pop();

    if (ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdf = await pdfParse(buffer);
      text = pdf.text;
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // Plain text
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      await db
        .update(documents)
        .set({ status: "error" })
        .where(eq(documents.id, id));
      return NextResponse.json(
        { error: "No text extracted from document" },
        { status: 400 }
      );
    }

    // Chunk: ~800 tokens (~3200 chars), 100-token overlap (~400 chars), split on sentence boundaries
    const chunks = chunkText(text, 3200, 400);

    // Embed all chunks
    const embeddings = await embedChunks(chunks);

    // Insert into document_chunks
    const chunkRows = chunks.map((content, i) => ({
      documentId: id,
      caseId: doc.caseId,
      content,
      chunkIndex: i,
      embedding: embeddings[i],
    }));

    if (chunkRows.length > 0) {
      await db.insert(documentChunks).values(chunkRows);
    }

    // Mark document as ready
    await db
      .update(documents)
      .set({ status: "ready" })
      .where(eq(documents.id, id));

    return NextResponse.json({
      success: true,
      chunks: chunkRows.length,
    });
  } catch (err) {
    console.error("Document processing error:", err);
    await db
      .update(documents)
      .set({ status: "error" })
      .where(eq(documents.id, id));
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];

  let current = "";
  let overlapBuffer = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      // Keep last ~overlap chars for context continuity
      overlapBuffer = current.slice(-overlap);
      current = overlapBuffer + sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

async function embedChunks(chunks: string[]): Promise<number[][]> {
  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    allEmbeddings.push(...res.data.map((d) => d.embedding));
  }

  return allEmbeddings;
}
