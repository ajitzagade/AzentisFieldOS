// FR-30 (AD-3): the client uploads photo bytes directly to R2 via a
// short-lived presigned URL — apps/api grants permission but never sits in
// the data path for the bytes themselves (NFR-5's 2G/3G reality).
export async function uploadPhoto(apiUrl: string, dailySiteReportId: string, file: File): Promise<{ storageKey: string }> {
  const presignRes = await fetch(`${apiUrl}/photos/presign`, {
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

  const confirmRes = await fetch(`${apiUrl}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dailySiteReportId, storageKey }),
  });
  if (!confirmRes.ok) {
    throw new Error("Could not confirm this photo's upload");
  }

  return { storageKey };
}
