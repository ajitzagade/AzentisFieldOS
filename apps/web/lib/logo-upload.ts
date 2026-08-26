// Story 14.1 (FR-47, AD-3): the branding logo reuses Epic 3's exact
// presign→PUT→store-URL upload flow (see photo-upload.ts) — apps/api grants a
// short-lived presigned URL, the browser PUTs the bytes straight to R2, and the
// durable public `logoUrl` comes back to be persisted on Save. The ONLY
// difference from the DSR photo path is the destination: the URL is stored on
// BrandingConfig.logoUrl (via PATCH /branding-config) instead of creating a
// Photo row, so there is no separate confirm step here.
export async function uploadBrandingLogo(
  apiUrl: string,
  file: File,
): Promise<{ logoUrl: string }> {
  const presignRes = await fetch(`${apiUrl}/branding-config/logo/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!presignRes.ok) {
    throw new Error("Could not get an upload URL for the logo");
  }
  const { uploadUrl, logoUrl } = (await presignRes.json()) as {
    uploadUrl: string;
    storageKey: string;
    logoUrl: string;
  };

  const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!putRes.ok) {
    throw new Error("Logo upload to storage failed");
  }

  return { logoUrl };
}
