import type { AuthedFetch } from "./authed-fetch-core";

// A site photo straight off a phone camera is routinely 3-10MB — on the
// 2G/3G connection NFR-5 assumes, that's the single largest real-world
// latency cost in the whole DSR flow. Downscale to a long edge generous
// enough for any current display context (thumbnail grids, a future
// lightbox) and re-encode as JPEG, which every current signed-upload
// caller's allowed_formats list accepts. Skip the whole pass for a file
// that's already small — nothing to gain, only CPU to spend.
const MAX_DIMENSION_PX = 1600;
const JPEG_QUALITY = 0.8;
const SKIP_COMPRESSION_BELOW_BYTES = 300 * 1024;

function withJpegExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return `${dot === -1 ? name : name.slice(0, dot)}.jpg`;
}

// Best-effort: HEIC (the iPhone default) and any other format the browser
// can decode is compressed; anything that fails to decode/encode (including
// browsers with no HEIC support at all) falls straight back to uploading
// the original file untouched — a compression failure must never block the
// upload itself.
async function compressPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= SKIP_COMPRESSION_BELOW_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    // A compressed result that isn't actually smaller (e.g. an already
    // heavily-compressed JPEG) isn't worth the re-encode — keep the original.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], withJpegExtension(file.name), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

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
  // Compression (CPU-bound, client-side only) runs concurrently with the
  // presign round-trip (network-bound, server-side only) — independent
  // work, no reason to pay for both in sequence.
  const [presignRes, compressedFile] = await Promise.all([
    authedFetch(`/photos/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailySiteReportId }),
    }),
    compressPhoto(file),
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
    body: JSON.stringify({ dailySiteReportId, storageKey }),
  });
  if (!confirmRes.ok) {
    throw new Error("Could not confirm this photo's upload");
  }

  return { storageKey };
}
