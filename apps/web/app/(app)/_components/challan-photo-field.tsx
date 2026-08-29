"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button, CameraIcon } from "@azentisfieldos/ui";
import { uploadChallanPhoto } from "../../../lib/challan-upload";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

// Optional evidence photo of the physical Invoice/Challan, alongside the
// existing free-text invoiceOrChallanNo field on Purchase and RmcEntry
// forms. Same signed-direct-upload flow as the branding logo
// (uploadChallanPhoto mirrors uploadBrandingLogo) — the resulting URL is
// synced into a hidden input so it submits with the rest of the form, the
// same pattern purchase-form.tsx already uses to sync materialSizeId.
export function ChallanPhotoField({
  initialUrl,
  error,
}: {
  initialUrl?: string | null;
  error?: string;
}) {
  const authedFetch = useAuthedFetch();
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { challanPhotoUrl } = await uploadChallanPhoto(authedFetch, file);
      setPhotoUrl(challanPhotoUrl);
    } catch {
      setUploadError("Could not upload that photo. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="mb-4">
      <input type="hidden" name="challanPhotoUrl" value={photoUrl ?? ""} />
      <span className="mb-1 block text-caption font-semibold text-ink-700">Challan Photo</span>
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-hairline bg-surface-2">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- runtime-uploaded photo, not a build-time asset
            <img src={photoUrl} alt="Challan" className="size-full object-cover" />
          ) : (
            <CameraIcon className="size-5 text-ink-500" />
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? "Replace photo" : "Attach challan photo"}
          </Button>
          <p className="mt-1 text-eyebrow text-ink-500">Optional — a photo of the physical document.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Upload challan photo"
          onChange={handleChange}
        />
      </div>
      {uploadError ? (
        <p role="alert" className="mt-1 text-eyebrow text-danger-700">
          {uploadError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1 text-eyebrow text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
