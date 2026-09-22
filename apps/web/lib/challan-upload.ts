import type { AuthedFetch } from "./authed-fetch-core";
import { compressPhotoForUpload } from "./photo-upload";

// Same sign→POST→store-URL flow as uploadBrandingLogo (AD-3): apps/api
// mints a short-lived Cloudinary signature, the browser POSTs the bytes
// straight to Cloudinary, and the durable public challanPhotoUrl comes back
// to be submitted alongside the rest of the Purchase/RMC entry form.
export async function uploadChallanPhoto(
  authedFetch: AuthedFetch,
  file: File,
): Promise<{ challanPhotoUrl: string }> {
  // Bug (2026-09-22): every other photo path in this app (DSR, Site Photos,
  // Measurement, Attach Bill) compresses before upload — this one shipped
  // without it and uploaded the raw camera file straight through.
  const [presignRes, compressedFile] = await Promise.all([
    authedFetch(`/photos/challan/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
    compressPhotoForUpload(file),
  ]);
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for the challan photo");
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
      challanPhotoUrl: string;
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
    throw new Error("Challan photo upload to storage failed");
  }
  const { secure_url: challanPhotoUrl } = (await uploadRes.json()) as {
    public_id: string;
    secure_url: string;
  };

  return { challanPhotoUrl };
}
