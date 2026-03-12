import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { depositions } from "@/db";
import { sql } from "drizzle-orm";

// POST /api/depositions/[id]/stop — stop Recall.ai bot
export async function POST(
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

  if (depo.recallBotId) {
    try {
      await fetch(
        `https://us-west-2.recall.ai/api/v1/bot/${depo.recallBotId}/leave_call/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.RECALL_AI_API_KEY}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to stop bot:", err);
    }
  }

  await db
    .update(depositions)
    .set({ status: "done" })
    .where(sql`${depositions.id} = ${id}::uuid`);

  return NextResponse.json({ success: true });
}
