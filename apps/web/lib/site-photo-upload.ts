import type { AuthedFetch } from "./authed-fetch-core";
import { compressPhotoForUpload } from "./photo-upload";

// Direct-to-Site upload (2026-09-20) — for a photo captured but not
// uploaded during that day's Daily Report. Same sign→POST→confirm flow as
// uploadPhoto (AD-3: apps/api mints the signature, the browser POSTs bytes
// straight to Cloudinary), only the parent is a Site instead of a DSR, and
// there is no gallery-hidden-until-Finalize concern since this never goes
// through a draft.
export async function uploadSitePhoto(
  authedFetch: AuthedFetch,
  siteId: string,
  file: File,
  options: { category?: "GENERAL" | "MEASUREMENT"; description?: string } = {},
): Promise<{ storageKey: string }> {
  const [presignRes, compressedFile] = await Promise.all([
    authedFetch(`/photos/site-presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    }),
    compressPhotoForUpload(file),
  ]);
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for this photo");
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
    };

  const form = new FormData();
  form.append("file", compressedFile);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("public_id", publicId);
  form.append("allowed_formats", allowedFormats);

  const uploadRes = await fetch(uploadUrl, { method: "POST", body: form });
  if (!uploadRes.ok) {
    throw new Error("Photo upload to storage failed");
  }
  const { public_id: storageKey } = (await uploadRes.json()) as {
    public_id: string;
    secure_url: string;
  };

  const confirmRes = await authedFetch(`/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      siteId,
      storageKey,
      category: options.category,
      description: options.description,
    }),
  });
  if (!confirmRes.ok) {
    throw new Error("Could not confirm this photo's upload");
  }

  return { storageKey };
}
