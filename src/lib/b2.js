import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

export async function getSignedThumbUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: key });
  return getSignedUrl(b2Client, command, { expiresIn });
}