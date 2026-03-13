import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { db } from "@/lib/db";
import { documentChunks, documents } from "@/db";
import { eq, sql } from "drizzle-orm";

// POST /api/cases/[id]/search — vector search over case documents
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: caseId } = params;
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  // Embed the query
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const embedding = embeddingRes.data[0].embedding;
  const embeddingStr = `[${embedding.join(",")}]`;

  // Vector similarity search
  const chunks = await db
    .select({
      id: documentChunks.id,
      content: documentChunks.content,
      chunkIndex: documentChunks.chunkIndex,
      documentId: documentChunks.documentId,
      documentFilename: documents.filename,
    })
    .from(documentChunks)
    .innerJoin(documents, eq(documentChunks.documentId, documents.id))
    .where(sql`${documentChunks.caseId} = ${caseId}::uuid`)
    .orderBy(sql`${documentChunks.embedding} <=> ${embeddingStr}::vector`)
    .limit(8);

  return NextResponse.json({ chunks });
}
