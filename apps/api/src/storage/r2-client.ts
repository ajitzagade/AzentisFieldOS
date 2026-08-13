import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 is S3-API-compatible, so the standard AWS SDK v3 works
// against it directly with no R2-specific SDK — `region: "auto"` and the
// account-scoped R2 endpoint are the only differences from talking to real
// S3 (confirmed current Cloudflare R2 practice as of 2026).
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

export const r2BucketName = process.env.R2_BUCKET_NAME ?? '';
