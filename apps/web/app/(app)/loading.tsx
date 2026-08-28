// Route-group loading state for every sidebar-navigable page — a designed
// skeleton (AD-6) instead of a blank main column while a server component
// fetches. Mirrors DataTable's pulse-skeleton treatment.
export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading page" className="flex flex-col gap-4">
      <div className="h-7 w-52 animate-pulse rounded-md bg-surface-3" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-surface-2" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-10 animate-pulse rounded-md bg-surface-2" />
        <div className="h-10 animate-pulse rounded-md bg-surface-2" />
        <div className="h-10 animate-pulse rounded-md bg-surface-2" />
      </div>
    </div>
  );
}
