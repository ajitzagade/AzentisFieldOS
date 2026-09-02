"use client";

import { Button, SearchIcon } from "@azentisfieldos/ui";
import { useOpenGlobalSearch } from "./global-search";

// Story 19.3: the Dashboard header's "Search ⌘K" chip. owner-dashboard.tsx
// is a Server Component and can't call useGlobalSearchController() itself
// (that would spawn a second, unsynced palette instance — see that hook's
// doc comment), so this is the one new Client Component that consumes
// app-shell.tsx's GlobalSearchContext to open the existing singleton
// palette instead.
export function DashboardSearchButton() {
  const search = useOpenGlobalSearch();

  return (
    <Button type="button" variant="ghost" size="sm" onClick={search.open}>
      <SearchIcon className="size-4" />
      Search ⌘K
    </Button>
  );
}
