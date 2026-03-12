import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documentChunks, documents } from "@/db";
import { eq, sql } from "drizzle-orm";

// GET /api/cases/[id]/chunks?limit=40
// Returns chunks sampled across documents for context
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: caseId } = params;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "40");

  const chunks = await db
    .select({
      content: documentChunks.content,
      chunkIndex: documentChunks.chunkIndex,
      documentFilename: documents.filename,
    })
    .from(documentChunks)
    .innerJoin(documents, eq(documentChunks.documentId, documents.id))
    .where(sql`${documentChunks.caseId} = ${caseId}::uuid`)
    .orderBy(sql`random()`)
    .limit(limit);

  return NextResponse.json({ chunks });
}
