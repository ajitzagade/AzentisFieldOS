import Link from "next/link";
import { notFound } from "next/navigation";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { CameraIcon, EmptyState } from "@azentisfieldos/ui";
import type { Site } from "../../page";
import { PhotoGalleryGrid } from "../../../_components/photo-gallery-grid";

async function getSite(id: string): Promise<Pick<Site, "id" | "name"> | null> {
  const res = await fetch(`${process.env.API_URL}/sites/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site (${res.status})`);
  }
  return res.json();
}

// FR-31: every photo from every DSR at this Site, newest-first.
async function getSitePhotos(id: string): Promise<PhotoGalleryItem[]> {
  const res = await fetch(`${process.env.API_URL}/sites/${id}/photos`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Site photos (${res.status})`);
  }
  return res.json();
}

export default async function SitePhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) {
    notFound();
  }
  const photos = await getSitePhotos(id);

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/sites" className="hover:text-accent-teal-700 hover:underline">
          Sites
        </Link>{" "}
        /{" "}
        <Link href={`/sites/${site.id}`} className="hover:text-accent-teal-700 hover:underline">
          {site.name}
        </Link>{" "}
        / Photos
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">{site.name} — Site Photos</h1>

      {photos.length === 0 ? (
        <EmptyState icon={<CameraIcon />} message="No photos yet for this Site." />
      ) : (
        <PhotoGalleryGrid photos={photos} />
      )}
    </>
  );
}
