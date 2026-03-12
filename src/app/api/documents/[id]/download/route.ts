import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { db } from "@/lib/db";
import { documents } from "@/db";
import { eq } from "drizzle-orm";

// GET /api/documents/[id]/download — returns a presigned download URL
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: doc.s3Key,
    ResponseContentDisposition: `attachment; filename="${doc.filename}"`,
  });

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({ downloadUrl, filename: doc.filename });
}
