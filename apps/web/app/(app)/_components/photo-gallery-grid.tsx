"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { Button, ChevronRightIcon } from "@azentisfieldos/ui";

// Epic 3's chronological Site photo gallery layout, extracted once Story 13.2's
// Site Reports view needed the same grid the Site Photos page (Story 3.3)
// already renders — one gallery layout, reused, rather than a second one.
// Each thumbnail is decorative (alt="") since the caption already conveys the
// date/uploader; the image is a durable Cloudinary CDN URL (already
// downsized/format-negotiated server-side by getThumbnailUrl), not a
// build-time static asset next/image's optimizer is set up for here.
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Click-to-preview lightbox: the grid owns its own open/selected state
// (openIndex into the same `photos` array it was already given — never a
// new fetch) so all three existing callers (Site detail, Site Photos, Site
// Report) get it automatically with no per-caller wiring. Chrome mirrors
// QuickCreateModal's Dialog.Root/Portal/Backdrop/Popup exactly (same Base
// UI primitive, same z-50/backdrop/surface classes) — this is a viewer, not
// a confirmation, so it's the plain Dialog, not AlertDialog.
export function PhotoGalleryGrid({ photos }: { photos: PhotoGalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activePhoto = openIndex !== null ? photos[openIndex] : undefined;
  const hasPrevious = openIndex !== null && openIndex > 0;
  const hasNext = openIndex !== null && openIndex < photos.length - 1;

  function showPrevious() {
    setOpenIndex((current) => (current !== null && current > 0 ? current - 1 : current));
  }

  function showNext() {
    setOpenIndex((current) =>
      current !== null && current < photos.length - 1 ? current + 1 : current,
    );
  }

  // Escape and backdrop-click already close the dialog via Base UI's own
  // default dismiss behavior (same as every other Dialog.Root in this app) —
  // only Next/Previous arrow-key nav needs to be wired by hand here. A
  // document-level listener (rather than an onKeyDown on the Popup) is
  // deliberate: the Previous/Next button that has focus can itself unmount
  // (it's hidden at a boundary) the moment it's clicked, which would strand
  // focus outside the popup subtree and stop a Popup-scoped handler from
  // ever seeing the next keypress.
  useEffect(() => {
    if (openIndex === null) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // showPrevious/showNext close over `photos.length` only, not `openIndex`;
    // re-subscribing per openIndex change (via this effect's own dependency)
    // is what keeps the bounds check current without needing them here too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {photos.map((photo, index) => (
          <figure
            key={photo.id}
            className="overflow-hidden rounded-md border border-border-hairline bg-surface-1"
          >
            <div className="aspect-square bg-surface-2">
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`View photo from ${formatDate(photo.reportDate)}`}
                className="block size-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a
                    durable Cloudinary CDN URL, not a build-time static asset
                    next/image's optimizer is set up for here. */}
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            </div>
            <figcaption className="p-2 text-caption text-ink-500">
              {formatDate(photo.reportDate)} · {photo.uploaderName}
            </figcaption>
          </figure>
        ))}
      </div>

      <Dialog.Root
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/50" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-surface-1 shadow-3">
            <Dialog.Title className="sr-only">Photo preview</Dialog.Title>
            {activePhoto ? (
              <>
                <div className="relative flex min-h-0 flex-1 items-center justify-center bg-surface-2 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- see
                      the grid thumbnail's own note above; same durable CDN URL,
                      just the larger previewUrl rendition. */}
                  <img
                    src={activePhoto.previewUrl}
                    alt=""
                    className="max-h-[75vh] max-w-full object-contain"
                  />
                  {hasPrevious ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      iconOnly
                      onClick={showPrevious}
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                    >
                      <ChevronRightIcon className="size-5 rotate-180" aria-hidden />
                    </Button>
                  ) : null}
                  {hasNext ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      iconOnly
                      onClick={showNext}
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <ChevronRightIcon className="size-5" aria-hidden />
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="text-body-sm text-ink-500">
                    {formatDate(activePhoto.reportDate)} · {activePhoto.uploaderName}
                  </p>
                  <Dialog.Close render={<Button type="button" variant="secondary" size="sm" />}>
                    Close
                  </Dialog.Close>
                </div>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
