import type { RecentlyViewedType } from "./recently-viewed";

// Story 16.6: Recently Viewed (recently-viewed-chips.tsx) and Global
// Search's handleSelect (global-search.tsx) each independently computed
// this exact `${base}/${id}` pattern for the four entity types they both
// cover — a route rename had to be applied in two places. One helper now,
// consumed by both. Only these four: every other search-result group has
// routing too specific (correction vs. pricing branches, nested Site/Site
// Contract paths) to fit a flat base+id shape.
const HREF_BASE: Record<RecentlyViewedType, string> = {
  site: "/sites",
  vendor: "/vendors",
  "team-member": "/team",
  subcontractor: "/subcontractors",
};

export function entityHref(type: RecentlyViewedType, id: string): string {
  return `${HREF_BASE[type]}/${id}`;
}
