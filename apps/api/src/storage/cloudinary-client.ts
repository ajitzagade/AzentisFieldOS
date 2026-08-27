import { v2 as cloudinary } from 'cloudinary';

// Cloudinary is the image-storage provider (replacing the earlier Cloudflare R2
// integration). apps/api holds the API secret and only ever issues a per-upload
// signature — it never sits in the byte path (NFR-5/AD-3): the browser POSTs the
// bytes straight to Cloudinary's upload endpoint, and delivery is a plain public
// CDN URL.
//
// The SDK auto-reads `CLOUDINARY_URL` if present; we also pass the discrete
// vars when set so an environment that configures only
// CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET works identically. `secure: true`
// keeps generated URLs on https.
const config: Record<string, unknown> = { secure: true };
if (process.env.CLOUDINARY_CLOUD_NAME)
  config.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
if (process.env.CLOUDINARY_API_KEY)
  config.api_key = process.env.CLOUDINARY_API_KEY;
if (process.env.CLOUDINARY_API_SECRET)
  config.api_secret = process.env.CLOUDINARY_API_SECRET;
cloudinary.config(config);

export { cloudinary };

// A durable, public delivery URL for a stored asset — Cloudinary serves these
// straight off its CDN with no presign/expiry, so a URL stored here (e.g.
// BrandingConfig.logoUrl, denormalized into every compiled report and rendered
// as an <img src>) never goes stale. Because we set an explicit `public_id` on
// upload, this URL is deterministic and can be predicted before the bytes land.
export function cloudinaryUrl(publicId: string): string {
  const cloudName =
    (cloudinary.config().cloud_name as string | undefined) ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    'cloud';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}
