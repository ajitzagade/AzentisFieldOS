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

// A durable, public object URL for a stored key — used where a stored URL must
// outlive a short-lived presigned GET (e.g. BrandingConfig.logoUrl, which is
// denormalized into every compiled report and rendered as an <img src> in the
// delivered artifact; a 1-hour presigned URL would go stale). In a real
// deployment R2_PUBLIC_BASE_URL points at the bucket's public/custom domain;
// absent that it falls back to the account-scoped endpoint + bucket path. Like
// the rest of the R2 client, this has never been exercised against a real
// bucket — verify the round-trip once one exists (infra/provisioning R2 TODO).
export function r2PublicUrl(storageKey: string): string {
  const base =
    process.env.R2_PUBLIC_BASE_URL ??
    `https://${process.env.R2_ACCOUNT_ID ?? 'account'}.r2.cloudflarestorage.com/${r2BucketName || 'bucket'}`;
  return `${base.replace(/\/$/, '')}/${storageKey}`;
}
