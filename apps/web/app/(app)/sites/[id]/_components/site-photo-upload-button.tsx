"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, CameraIcon } from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { uploadSitePhoto } from "@/lib/site-photo-upload";

// Direct-to-Site upload (2026-09-20) — for a photo captured but not
// uploaded during that day's Daily Report. Shared by the Site Photos page
// and the Site detail page's "Recent Photos" preview so both surfaces gain
// upload with one component. Files under the upload date (today), never a
// user-chosen backdate — there is no Daily Report to anchor an earlier date
// to, and the parent Site page always re-fetches on success so the new
// photo appears immediately without a manual reload.
export function SitePhotoUploadButton({ siteId }: { siteId: string }) {
  const authedFetch = useAuthedFetch();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await uploadSitePhoto(authedFetch, siteId, file);
      router.refresh();
    } catch {
      setError("Could not upload that photo. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        isLoading={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <CameraIcon className="size-4" />
        Upload photo
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload a photo for this Site"
        onChange={handleChange}
      />
      {error ? (
        <p role="alert" className="mt-1 text-eyebrow text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
