import type { AuthedFetch } from "./authed-fetch-core";

// FR-30 (AD-3): the client uploads photo bytes directly to R2 via a
// short-lived presigned URL — apps/api grants permission but never sits in
// the data path for the bytes themselves (NFR-5's 2G/3G reality).
//
// Story 1.8 (AC #4): the two apps/api calls (presign, confirm) go through the
// shared authed-fetch helper so they carry the Clerk session token; only the
// direct-to-R2 PUT uses a raw `fetch`, since that presigned URL is its own
// bearer of authority and must NOT carry an Authorization header.
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
  const { uploadUrl, storageKey } = (await presignRes.json()) as { uploadUrl: string; storageKey: string };

  const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!putRes.ok) {
    throw new Error("Photo upload to storage failed");
  }

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
