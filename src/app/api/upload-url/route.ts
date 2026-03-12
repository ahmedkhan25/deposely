import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { db } from "@/lib/db";
import { documents } from "@/db";
import { randomUUID } from "crypto";

// GET /api/upload-url?caseId=xxx&filename=xxx&size=xxx
export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get("caseId");
  const filename = req.nextUrl.searchParams.get("filename");
  const size = req.nextUrl.searchParams.get("size");

  if (!caseId || !filename) {
    return NextResponse.json(
      { error: "caseId and filename are required" },
      { status: 400 }
    );
  }

  const s3Key = `cases/${caseId}/${randomUUID()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: s3Key,
    ContentType: "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  // Create document record in pending state
  const [doc] = await db
    .insert(documents)
    .values({
      caseId,
      filename,
      s3Key,
      sizeBytes: size ? parseInt(size) : null,
      status: "pending",
    })
    .returning();

  return NextResponse.json({ uploadUrl, document: doc });
}
