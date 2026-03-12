import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { depositions } from "@/db";
import { eq, desc } from "drizzle-orm";

// GET /api/depositions?caseId=xxx — list depositions for a case
export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get("caseId");
  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(depositions)
    .where(eq(depositions.caseId, caseId))
    .orderBy(desc(depositions.createdAt));

  return NextResponse.json(rows);
}

// POST /api/depositions — create deposition + send Recall.ai bot
export async function POST(req: NextRequest) {
  const { caseId, title, zoomUrl } = await req.json();

  if (!caseId || !title || !zoomUrl) {
    return NextResponse.json(
      { error: "caseId, title, and zoomUrl are required" },
      { status: 400 }
    );
  }

  // Create deposition record
  const [depo] = await db
    .insert(depositions)
    .values({ caseId, title, zoomUrl, status: "pending" })
    .returning();

  // Send Recall.ai bot to the Zoom meeting
  try {
    const recallRes = await fetch("https://us-west-2.recall.ai/api/v1/bot/", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.RECALL_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_url: zoomUrl,
        bot_name: "Deposely",
        transcription_options: {
          provider: "recalled_ai",
          mode: "prioritize_low_latency",
        },
        recording_config: {
          real_time_endpoints: [
            {
              type: "webhook",
              config: {
                url: `${process.env.RENDER_WEBHOOK_URL}/webhook/recall/realtime?token=${process.env.RECALL_WEBHOOK_SECRET}`,
                events: ["bot.transcription"],
              },
            },
          ],
        },
      }),
    });

    if (recallRes.ok) {
      const bot = await recallRes.json();
      await db
        .update(depositions)
        .set({ recallBotId: bot.id })
        .where(eq(depositions.id, depo.id));
    } else {
      console.error("Recall.ai bot creation failed:", await recallRes.text());
    }
  } catch (err) {
    console.error("Recall.ai API error:", err);
  }

  return NextResponse.json(depo, { status: 201 });
}
