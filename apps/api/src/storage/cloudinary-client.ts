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
    cloudinary.config().cloud_name ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    'cloud';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

// A downsized, format-negotiated delivery URL for thumbnail/grid contexts
// (DSR/Site photo galleries) — NOT for any URL that gets stored as a
// record's own field (Purchase/RmcEntry.challanPhotoUrl,
// BrandingConfig.logoUrl): those must stay the untransformed, full-resolution
// cloudinaryUrl() so a "view/download original" link and any future
// full-size use keep working. `c_limit` only ever shrinks, never upscales,
// and preserves aspect ratio; `q_auto,f_auto` lets Cloudinary pick the
// smallest acceptable quality and a browser-safe format per requester —
// this is also what fixes iPhone HEIC photos (allowed on upload,
// apps/web/src/storage/storage.service.ts's presignUpload) failing to
// render as a plain <img> in Chrome/Firefox, which don't support HEIC.
export function cloudinaryThumbnailUrl(publicId: string, width = 480): string {
  const cloudName =
    cloudinary.config().cloud_name ??
    process.env.CLOUDINARY_CLOUD_NAME ??
    'cloud';
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},c_limit,q_auto,f_auto/${publicId}`;
}
