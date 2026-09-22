import type { AuthedFetch } from "./authed-fetch-core";
import { compressPhotoForUpload } from "./photo-upload";

// Attach Bill (2026-09-22): the same sign→POST→confirm flow as uploadPhoto
// (AD-3 — apps/api never sits in the byte path), scoped to an existing
// Purchase instead of a DSR. Owner/Admin only (enforced by the presign and
// confirm endpoints, not here) — a Purchase stays valid and complete with
// zero bills attached, so this is only ever called from an explicit
// "Attach Bill" action, never a required step.
export async function uploadPurchaseBill(
  authedFetch: AuthedFetch,
  purchaseId: string,
  file: File,
): Promise<{ id: string; url: string | null; uploadedByName: string; createdAt: string }> {
  const [presignRes, compressedFile] = await Promise.all([
    authedFetch(`/photos/purchase-bill/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId }),
    }),
    compressPhotoForUpload(file),
  ]);
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for this bill");
  }
  const { uploadUrl, apiKey, timestamp, signature, publicId, allowedFormats } =
    (await presignRes.json()) as {
      uploadUrl: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      publicId: string;
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
    throw new Error("Bill upload to storage failed");
  }
  const { public_id: storageKey } = (await uploadRes.json()) as {
    public_id: string;
    secure_url: string;
  };

  const confirmRes = await authedFetch(`/purchases/${purchaseId}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storageKey }),
  });
  if (!confirmRes.ok) {
    throw new Error("Could not save this bill");
  }

  return confirmRes.json();
}
