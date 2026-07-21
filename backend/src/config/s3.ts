import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
});

export function getPresignedUploadUrl(key: string, contentType: string, contentLength: number) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return getSignedUrl(s3, command, { expiresIn: 60 * 5 });
}

export function getPublicFileUrl(key: string) {
  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`;
}
