"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { Button, PrinterIcon, cn } from "@azentisfieldos/ui";
import { formatDate } from "@/lib/format";

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
  6: "grid-cols-2 grid-rows-3",
};

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function PhotoCell({ siteName, photo }: { siteName: string; photo: PhotoGalleryItem }) {
  return (
    <figure className="flex min-h-0 flex-col overflow-hidden border border-border-hairline p-2">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- a durable
            Cloudinary CDN URL, not a build-time static asset; object-fit:
            contain here (never cropped) is the whole point of this view. */}
        <img src={photo.previewUrl} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <figcaption className="mt-1 shrink-0 text-caption text-ink-500">
        {siteName} · {formatDate(photo.reportDate)}
        {photo.category === "MEASUREMENT" ? " · Measurement" : null}
        {photo.description ? ` · ${photo.description}` : null}
      </figcaption>
    </figure>
  );
}

// Print (2026-09-21): triggers the browser's native print dialog — no PDF
// generation library, keeping this self-contained. Every non-photo control
// carries `print:hidden` so the printed output is exactly the photo pages,
// nothing else.
export function PhotoPrintView({
  siteId,
  siteName,
  photos,
  layout,
}: {
  siteId: string;
  siteName: string;
  photos: PhotoGalleryItem[];
  layout: number;
}) {
  useEffect(() => {
    if (photos.length > 0) window.print();
  }, [photos.length]);

  const pages = chunk(photos, layout);

  return (
    <div>
      <div className="print:hidden mb-4 flex items-center justify-between gap-3">
        <Link href={`/sites/${siteId}/photos`} className="text-body-sm text-accent-teal-700 underline">
          ← Back to Site Photos
        </Link>
        <Button type="button" onClick={() => window.print()}>
          <PrinterIcon className="size-4" />
          Print
        </Button>
      </div>

      {photos.length === 0 ? (
        <p className="print:hidden text-body-sm text-ink-500">No photos selected.</p>
      ) : (
        pages.map((pagePhotos, pageIndex) => (
          <div
            key={pageIndex}
            className={cn(
              "mb-6 grid gap-2 print:mb-0 print:h-screen print:gap-1 print:break-after-page last:print:break-after-auto",
              GRID_CLASS[layout] ?? GRID_CLASS[1],
            )}
          >
            {pagePhotos.map((photo) => (
              <PhotoCell key={photo.id} siteName={siteName} photo={photo} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
