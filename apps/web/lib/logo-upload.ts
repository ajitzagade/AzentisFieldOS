import type { AuthedFetch } from "./authed-fetch-core";

// Story 14.1 (FR-47, AD-3): the branding logo reuses Epic 3's exact
// sign→POST→store-URL upload flow (see photo-upload.ts) — apps/api mints a
// short-lived signature, the browser POSTs the bytes straight to Cloudinary, and
// the durable public `logoUrl` comes back to be persisted on Save. The ONLY
// difference from the DSR photo path is the destination: the URL is stored on
// BrandingConfig.logoUrl (via PATCH /branding-config) instead of creating a
// Photo row, so there is no separate confirm step here.
//
// Story 1.8 (AC #4): the presign call goes through the shared authed-fetch
// helper (session token attached); the direct-to-Cloudinary POST stays a raw
// `fetch`, as the signed request carries its own scoped authority.
export async function uploadBrandingLogo(
  authedFetch: AuthedFetch,
  file: File,
): Promise<{ logoUrl: string }> {
  const presignRes = await authedFetch(`/branding-config/logo/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for the logo");
  }
  const { uploadUrl, apiKey, timestamp, signature, publicId, allowedFormats } =
    (await presignRes.json()) as {
      uploadUrl: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      publicId: string;
      storageKey: string;
      allowedFormats: string;
      logoUrl: string;
    };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("public_id", publicId);
  form.append("allowed_formats", allowedFormats);

  const uploadRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!uploadRes.ok) {
    throw new Error("Logo upload to storage failed");
  }
  // Cloudinary returns the durable delivery URL directly; it equals the
  // `logoUrl` the presign step predicted from the same public_id.
  const { secure_url: logoUrl } = (await uploadRes.json()) as {
    public_id: string;
    secure_url: string;
  };

  return { logoUrl };
}
