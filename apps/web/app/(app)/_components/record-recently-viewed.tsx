"use client";

import { useEffect } from "react";
import { recordRecentlyViewed, type RecentlyViewedType } from "@/lib/recently-viewed";

// Story 19.6: the client-island mounted near the top of each of the four
// Server Component detail pages (Site/Vendor/Team Member/Subcontractor) —
// mirrors AdvanceQuickEntryTrigger's "client island inside a Server
// Component" pattern so the page itself never becomes a Client Component.
// Renders nothing; its only job is recording the view once per mount.
export function RecordRecentlyViewed({ type, id, name }: { type: RecentlyViewedType; id: string; name: string }) {
  useEffect(() => {
    recordRecentlyViewed({ type, id, name });
  }, [type, id, name]);

  return null;
}
