import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cases, documents, depositions } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

// GET /api/cases — list cases with doc + depo counts
export async function GET() {
  const rows = await db
    .select({
      id: cases.id,
      title: cases.title,
      description: cases.description,
      createdAt: cases.createdAt,
      docCount: sql<number>`count(distinct ${documents.id})`.as("doc_count"),
      depoCount: sql<number>`count(distinct ${depositions.id})`.as("depo_count"),
    })
    .from(cases)
    .leftJoin(documents, eq(documents.caseId, cases.id))
    .leftJoin(depositions, eq(depositions.caseId, cases.id))
    .groupBy(cases.id)
    .orderBy(desc(cases.createdAt));

  return NextResponse.json(rows);
}

// POST /api/cases — create case
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [newCase] = await db
    .insert(cases)
    .values({ title, description: description || null })
    .returning();

  return NextResponse.json(newCase, { status: 201 });
}
