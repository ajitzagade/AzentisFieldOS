import type { AuthedFetch } from "./authed-fetch-core";

// FR-30 (AD-3): the client uploads photo bytes directly to Cloudinary via a
// short-lived signed request — apps/api mints the signature but never sits in
// the data path for the bytes themselves (NFR-5's 2G/3G reality).
//
// Story 1.8 (AC #4): the two apps/api calls (presign, confirm) go through the
// shared authed-fetch helper so they carry the session token; only the
// direct-to-Cloudinary POST uses a raw `fetch`, since that signed request is
// its own bearer of authority and must NOT carry an Authorization header.
export async function uploadPhoto(
  authedFetch: AuthedFetch,
  dailySiteReportId: string,
  file: File,
): Promise<{ storageKey: string }> {
  const presignRes = await authedFetch(`/photos/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dailySiteReportId }),
  });
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
  form.append("file", file);
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
    body: JSON.stringify({ dailySiteReportId, storageKey }),
  });
  if (!confirmRes.ok) {
    throw new Error("Could not confirm this photo's upload");
  }

  return { storageKey };
}
