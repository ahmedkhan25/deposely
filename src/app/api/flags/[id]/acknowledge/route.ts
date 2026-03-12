import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contradictionFlags } from "@/db";
import { sql } from "drizzle-orm";

// POST /api/flags/[id]/acknowledge — mark flag as dismissed
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db
    .update(contradictionFlags)
    .set({ dismissed: true })
    .where(sql`${contradictionFlags.id} = ${params.id}::uuid`);

  return NextResponse.json({ success: true });
}
