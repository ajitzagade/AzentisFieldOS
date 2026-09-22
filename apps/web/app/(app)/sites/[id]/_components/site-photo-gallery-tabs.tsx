"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { Button, cn, EmptyState, CameraIcon, PrinterIcon } from "@azentisfieldos/ui";
import { PhotoGalleryGrid } from "../../../_components/photo-gallery-grid";

const PRINT_LAYOUTS = [1, 2, 4, 6] as const;

// Measurement (2026-09-21): a separate subsection so Measurement photos are
// easy to find, per the ask — a client-side tab filter over the same
// already-fetched gallery array (this Site's photo count doesn't warrant a
// server round-trip per tab switch).
//
// Print (2026-09-21): "Select to print" turns the grid selectable
// (PhotoGalleryGrid's own opt-in prop) — once at least one photo is picked,
// choosing a layout navigates to the dedicated print view with the
// selected ids, so the browser's native print dialog (triggered there,
// never here) only ever sees the print-formatted page, not this page's own
// tabs/toggle chrome.
export function SitePhotoGalleryTabs({ siteId, photos }: { siteId: string; photos: PhotoGalleryItem[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "measurements">("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const measurementPhotos = photos.filter((p) => p.category === "MEASUREMENT");
  const visible = tab === "measurements" ? measurementPhotos : photos;

  function toggleSelectMode() {
    setSelectMode((current) => !current);
    setSelectedIds(new Set());
    setLayoutPickerOpen(false);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function printWithLayout(layout: number) {
    // Closed immediately, not left to unmount on navigation — a client-side
    // route transition isn't instant, so without this the dropdown stayed
    // visibly open (reported: "should get close to avoid the multiple
    // clicks") long enough to invite a second, confusing click.
    setLayoutPickerOpen(false);
    const ids = Array.from(selectedIds).join(",");
    router.push(`/sites/${siteId}/photos/print?ids=${encodeURIComponent(ids)}&layout=${layout}`);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-hairline">
        <div className="flex gap-2">
          {(
            [
              { key: "all" as const, label: `All (${photos.length})` },
              { key: "measurements" as const, label: `Measurements (${measurementPhotos.length})` },
            ]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 px-1 pb-2 text-body-sm font-medium transition-colors duration-(--default-transition-duration) ease-(--ease-standard)",
                tab === t.key
                  ? "border-accent-teal-700 text-accent-teal-700"
                  : "border-transparent text-ink-500 hover:text-ink-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {photos.length > 0 ? (
          <div className="mb-2 flex items-center gap-2">
            {selectMode ? (
              <span className="text-caption text-ink-500">{selectedIds.size} selected</span>
            ) : null}
            {selectMode && selectedIds.size > 0 ? (
              <div className="relative">
                <Button type="button" variant="secondary" size="sm" onClick={() => setLayoutPickerOpen((o) => !o)}>
                  <PrinterIcon className="size-4" />
                  Print
                </Button>
                {layoutPickerOpen ? (
                  <div className="absolute right-0 z-10 mt-1 flex flex-col gap-1 rounded-md border border-border-hairline bg-surface-1 p-2 shadow-2">
                    <span className="px-2 pb-1 text-caption text-ink-500">Photos per page</span>
                    {PRINT_LAYOUTS.map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => printWithLayout(layout)}
                        className="rounded-md px-2 py-1 text-left text-body-sm text-ink-900 hover:bg-surface-2"
                      >
                        {layout} per page
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <Button type="button" variant="secondary" size="sm" onClick={toggleSelectMode}>
              {selectMode ? "Cancel" : "Select to print"}
            </Button>
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<CameraIcon />}
          message={
            tab === "measurements"
              ? "No measurement photos yet — add one from the Measurement side-menu item."
              : "No photos yet for this Site — they arrive with Daily Reports, or upload one directly above."
          }
        />
      ) : (
        <PhotoGalleryGrid
          photos={visible}
          selectable={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelected}
        />
      )}
    </>
  );
}
