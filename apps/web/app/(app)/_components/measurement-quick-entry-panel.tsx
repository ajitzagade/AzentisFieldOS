"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui-components/react/dialog";
import { Button, CameraIcon, CheckCircleIcon, PencilIcon, TextField, useToast } from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { uploadSitePhoto } from "@/lib/site-photo-upload";
import { SiteField, type SiteOption } from "./site-field";

// Measurement (2026-09-21): a lightweight "Site + photo(s) + description"
// entry point, reachable from the persistent side-menu (both roles, since
// capturing a measurement in the field is exactly a Supervisor's job) and
// from the Owner Quick Add sheet / global search, mirroring
// AdvanceQuickEntryPanel's dual-reuse (global-search.tsx). Unlike Advance,
// this isn't a Server Action + useActionState form — saving a photo is the
// same two-step Cloudinary presign→POST→confirm flow SitePhotoUploadButton
// already uses (AD-3: apps/api never touches the bytes), just looped once
// per selected file and tagged with category: "MEASUREMENT" plus the typed
// description, so local component state (not useActionState) drives this
// form instead.
export function MeasurementQuickEntryPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const authedFetch = useAuthedFetch();
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sites, setSites] = useState<SiteOption[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadSites = useCallback(
    async (signal: AbortSignal) => {
      setSitesLoading(true);
      setSitesError(null);
      try {
        const res = await authedFetch("/sites", { signal });
        if (!res.ok) throw new Error(`Failed to load Sites (${res.status})`);
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("Malformed Sites response");
        if (!signal.aborted) setSites(data as SiteOption[]);
      } catch {
        if (!signal.aborted) setSitesError("Couldn't load Sites");
      } finally {
        if (!signal.aborted) setSitesLoading(false);
      }
    },
    [authedFetch],
  );

  // Resets and fetches fresh every time the modal opens — mirrors
  // AdvanceQuickEntryPanel's on-open effect (Team Members there, Sites here).
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form fresh on every open, mirroring AdvanceQuickEntryPanel's on-open effect
    setSiteId("");
    setDescription("");
    setFiles([]);
    setFormError(null);
    setFieldErrors({});
    loadSites(controller.signal);
    return () => controller.abort();
  }, [open, loadSites]);

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const errors: Record<string, string> = {};
    if (!siteId) errors.siteId = "Site is required";
    if (files.length === 0) errors.photos = "At least one photo is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      for (const file of files) {
        await uploadSitePhoto(authedFetch, siteId, file, {
          category: "MEASUREMENT",
          description: description.trim() || undefined,
        });
      }
      toast.success(files.length === 1 ? "Measurement photo saved" : `${files.length} measurement photos saved`);
      onOpenChange(false);
      router.refresh();
    } catch {
      setFormError("Could not save this measurement. Please try again.");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-100 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-1 p-6 shadow-3">
          <Dialog.Title className="mb-1 text-card-title text-ink-900">Add Measurement</Dialog.Title>
          <Dialog.Description className="mb-4 text-body-sm text-ink-500">
            Saved photos also appear under that Site&apos;s Photos, in a separate Measurements section.
          </Dialog.Description>

          <form onSubmit={handleSubmit} noValidate>
            <SiteField
              sites={sites}
              required
              onSiteChange={setSiteId}
              disabled={Boolean(sitesError)}
              error={sitesError ?? fieldErrors.siteId}
              hint={sitesLoading ? "Loading Sites…" : undefined}
            />

            <div className="mb-4">
              <span className="mb-1 flex items-baseline gap-0.5 text-caption font-semibold text-ink-700">
                Measurement Photo(s) <span aria-hidden="true" className="text-danger-700">*</span>
              </span>
              <div>
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <CameraIcon className="size-4" />
                  {files.length > 0 ? `${files.length} photo${files.length === 1 ? "" : "s"} selected` : "Choose photos"}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-label="Measurement photos"
                onChange={handleFilesChange}
              />
              {fieldErrors.photos ? (
                <p role="alert" className="mt-1 text-caption text-danger-700">
                  {fieldErrors.photos}
                </p>
              ) : null}
            </div>

            <TextField
              label="Description"
              name="description"
              hint="Optional"
              icon={<PencilIcon className="size-4" />}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            {formError ? (
              <p role="alert" className="mb-4 text-caption text-danger-700">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close render={<Button type="button" variant="secondary" />}>Cancel</Dialog.Close>
              <Button type="submit" isLoading={submitting}>
                <CheckCircleIcon className="size-4" />
                Save Measurement
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
