import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contradictionFlags } from "@/db";
import { eq } from "drizzle-orm";

// POST /api/flags/[id]/acknowledge — mark flag as dismissed
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db
    .update(contradictionFlags)
    .set({ dismissed: true })
    .where(eq(contradictionFlags.id, params.id));

  return NextResponse.json({ success: true });
}
