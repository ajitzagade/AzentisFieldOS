import type { PhotoGalleryItem } from "@azentisfieldos/shared";

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

export function PhotoGalleryGrid({ photos }: { photos: PhotoGalleryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {photos.map((photo) => (
        <figure
          key={photo.id}
          className="overflow-hidden rounded-md border border-border-hairline bg-surface-1"
        >
          <div className="aspect-square bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- a
                durable Cloudinary CDN URL, not a build-time static asset
                next/image's optimizer is set up for here. */}
            <img
              src={photo.url}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
          <figcaption className="p-2 text-caption text-ink-500">
            {formatDate(photo.reportDate)} · {photo.uploaderName}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
