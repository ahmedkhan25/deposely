import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { depositions, contradictionFlags } from "@/db";
import { sql } from "drizzle-orm";

// GET /api/depositions/[id] — deposition + flags
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [depo] = await db
    .select()
    .from(depositions)
    .where(sql`${depositions.id} = ${id}::uuid`)
    .limit(1);

  if (!depo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const flags = await db
    .select()
    .from(contradictionFlags)
    .where(sql`${contradictionFlags.depositionId} = ${id}::uuid`);

  return NextResponse.json({ ...depo, flags });
}
