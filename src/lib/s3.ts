import { S3Client } from "@aws-sdk/client-s3";

let _s3: S3Client | null = null;

export function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3;
}

// Lazy proxy so existing `s3.send(...)` imports keep working
export const s3: S3Client = new Proxy({} as S3Client, {
  get(_target, prop, receiver) {
    return Reflect.get(getS3(), prop, receiver);
  },
});
