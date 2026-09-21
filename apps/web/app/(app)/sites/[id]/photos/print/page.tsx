import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import type { Site } from "../../../page";
import { PhotoPrintView } from "./print-view";

const ALLOWED_LAYOUTS = [1, 2, 4, 6] as const;
type PrintLayout = (typeof ALLOWED_LAYOUTS)[number];

async function getSite(id: string): Promise<Pick<Site, "id" | "name"> | null> {
  const res = await authedFetch(`/sites/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site (${res.status})`);
  }
  return res.json();
}

async function getSitePhotos(id: string): Promise<PhotoGalleryItem[]> {
  const res = await authedFetch(`/sites/${id}/photos`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Site photos (${res.status})`);
  }
  return res.json();
}

function parseLayout(value: string | undefined): PrintLayout {
  const n = Number(value);
  return (ALLOWED_LAYOUTS as readonly number[]).includes(n) ? (n as PrintLayout) : 1;
}

// Print (2026-09-21): a dedicated, print-only view — the gallery's own
// selection UI (tabs, Select-to-print toggle) must never appear on the
// printed page, so this is a separate route rather than a print stylesheet
// layered over the gallery page itself.
export default async function SitePhotosPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ids?: string; layout?: string }>;
}) {
  const { id } = await params;
  const { ids, layout } = await searchParams;
  const site = await getSite(id);
  if (!site) {
    notFound();
  }
  const selectedIds = new Set((ids ?? "").split(",").filter(Boolean));
  const allPhotos = await getSitePhotos(id);
  // Preserves the gallery's own newest-first order — not the arbitrary
  // order photos happened to be clicked in while selecting.
  const photos = allPhotos.filter((p) => selectedIds.has(p.id));

  return <PhotoPrintView siteId={site.id} siteName={site.name} photos={photos} layout={parseLayout(layout)} />;
}
