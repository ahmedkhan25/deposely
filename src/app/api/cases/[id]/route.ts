import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cases, documents } from "@/db";
import { eq } from "drizzle-orm";

// GET /api/cases/[id] — case + documents
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [caseRow] = await db
    .select()
    .from(cases)
    .where(eq(cases.id, id))
    .limit(1);

  if (!caseRow) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.caseId, id));

  return NextResponse.json({ ...caseRow, documents: docs });
}
