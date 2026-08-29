import type { AuthedFetch } from "./authed-fetch-core";

// Same sign→POST→store-URL flow as uploadBrandingLogo (AD-3): apps/api
// mints a short-lived Cloudinary signature, the browser POSTs the bytes
// straight to Cloudinary, and the durable public challanPhotoUrl comes back
// to be submitted alongside the rest of the Purchase/RMC entry form.
export async function uploadChallanPhoto(
  authedFetch: AuthedFetch,
  file: File,
): Promise<{ challanPhotoUrl: string }> {
  const presignRes = await authedFetch(`/photos/challan/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for the challan photo");
  }
  const { uploadUrl, apiKey, timestamp, signature, publicId } =
    (await presignRes.json()) as {
      uploadUrl: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      publicId: string;
      storageKey: string;
      challanPhotoUrl: string;
    };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("public_id", publicId);

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
