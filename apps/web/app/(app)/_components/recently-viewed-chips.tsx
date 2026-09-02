"use client";

import { type ReactNode } from "react";
import { BuildingIcon, EntityChip, MapPinIcon, UserIcon, UsersIcon } from "@azentisfieldos/ui";
import { useRecentlyViewed, type RecentlyViewedType } from "@/lib/recently-viewed";

// Same icon-per-entity-type convention as global-search.tsx's search-result
// groups and nav-config.ts's nav items — never a third hand-maintained icon
// map for the same four entities.
const TYPE_CONFIG: Record<RecentlyViewedType, { icon: ReactNode; label: string; hrefBase: string }> = {
  site: { icon: <MapPinIcon />, label: "Site", hrefBase: "/sites" },
  vendor: { icon: <BuildingIcon />, label: "Vendor", hrefBase: "/vendors" },
  "team-member": { icon: <UsersIcon />, label: "Team Member", hrefBase: "/team" },
  subcontractor: { icon: <UserIcon />, label: "Subcontractor", hrefBase: "/subcontractors" },
};

// Story 19.6: the Dashboard's horizontally-scrolling "recently viewed" row —
// reads the device-local MRU list (apps/web/lib/recently-viewed.ts) and
// renders nothing at all when it's empty (no empty-state placeholder for
// this lightweight, optional pattern — Boundaries: Never).
export function RecentlyViewedChips() {
  const entries = useRecentlyViewed();

  if (entries.length === 0) return null;

  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
      {entries.map((entry) => {
        const config = TYPE_CONFIG[entry.type];
        return (
          <EntityChip
            key={`${entry.type}:${entry.id}`}
            href={`${config.hrefBase}/${entry.id}`}
            icon={config.icon}
            name={entry.name}
            typeLabel={config.label}
          />
        );
      })}
    </div>
  );
}
