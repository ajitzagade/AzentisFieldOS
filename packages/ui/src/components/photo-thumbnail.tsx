"use client";

import { useState } from "react";
import { CameraIcon } from "../icons/camera-icon";
import { cn } from "../lib/cn";

// The single stored-photo renderer (AD-5). Every stored Cloudinary photo is
// a durable CDN URL, but "durable" isn't "never fails" — a transient
// network blip, a deleted asset, or a storage misconfiguration all fail a
// plain `<img>` the same way: the browser's own unstyled broken-image icon,
// with zero context. Reported bug (2026-09-22): a report reopened well
// after a real, successful upload showed exactly that, and read as "the
// upload never worked" with no way to tell the two apart. Every screen that
// renders a stored photo (Daily Report detail, Photo Gallery grid + its
// lightbox) goes through this one component so a failed load always
// degrades to the same clear, in-brand placeholder instead.
export interface PhotoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  /** Skip `loading="lazy"` — for the one-at-a-time lightbox image, which
   * should start fetching the moment it opens, not wait for scroll-into-view
   * (grid thumbnails, the common case, default to lazy). */
  eager?: boolean;
}

export function PhotoThumbnail({ src, alt, className, eager = false }: PhotoThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 bg-surface-2 text-ink-500",
          className,
        )}
      >
        <CameraIcon className="size-5" />
        <span className="text-caption">Photo unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a durable
    // Cloudinary CDN URL, not a build-time static asset next/image's
    // optimizer is set up for here.
    <img
      src={src}
      alt={alt}
      loading={eager ? undefined : "lazy"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
