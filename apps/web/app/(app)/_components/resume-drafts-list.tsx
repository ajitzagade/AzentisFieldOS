"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, ClipboardIcon, XIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { formatDate, formatDateTime } from "@/lib/format";

export interface DraftSummary {
  id: string;
  /** ISO date/datetime string — sliced to YYYY-MM-DD for the Resume link. */
  reportDate: string;
  updatedAt: string;
  site: { id: string; name: string };
}

// "My Drafts" quick-resume (2026-09-21, deferred-work.md): only rendered
// when there are 2+ open drafts — the single-draft case is handled for free
// by the Home hero card swapping to "Continue Daily Report" (zero extra UI,
// same tap the Supervisor already makes every day). This list exists only
// for the rarer multi-draft case (a Supervisor covering more than one Site,
// or a draft from a few days back they forgot about), so it needs its own
// explicit per-row Continue + Discard — a plain array-of-links can't offer
// Discard without navigating away first.
export function ResumeDraftsList({ drafts: initialDrafts }: { drafts: DraftSummary[] }) {
  const authedFetch = useAuthedFetch();
  // Review fix (simplification scan): forking the prop into `useState`
  // would go stale across a client-side navigation back to this same tree
  // position (App Router can reconcile in place without remounting) — track
  // only the local discard override and derive the rendered list from the
  // prop, so `initialDrafts` stays the single source of truth.
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const drafts = initialDrafts.filter((d) => !discardedIds.has(d.id));

  // Same window.confirm + DELETE /dsr/draft/:id flow as the DSR form's own
  // Discard button (dsr/new/page.tsx) — same action, same confirmation
  // wording, so a Supervisor sees one consistent "discard a draft" behavior
  // regardless of where they trigger it from.
  async function handleDiscard(id: string, siteName: string) {
    if (discardingId) return;
    const confirmed = window.confirm(
      `Discard the draft for ${siteName}? This permanently deletes it and any photos you added, and can't be undone.`,
    );
    if (!confirmed) return;

    setDiscardingId(id);
    try {
      const res = await authedFetch(`/dsr/draft/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDiscardedIds((ids) => new Set(ids).add(id));
      }
    } catch {
      // Transient failure — the row simply stays, so the user can retry.
    } finally {
      setDiscardingId(null);
    }
  }

  if (drafts.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-section-header text-ink-900">Continue an unfinished report</h2>
      <div className="flex flex-col gap-2">
        {drafts.map((draft) => (
          <Card key={draft.id} className="flex items-center gap-3 py-3">
            <ClipboardIcon className="size-5 shrink-0 text-accent-teal-700" />
            <div className="min-w-0 flex-1">
              <div className="text-body-sm font-semibold text-ink-900">{draft.site.name}</div>
              <p className="truncate text-caption text-ink-500">
                {formatDate(draft.reportDate)} — saved {formatDateTime(draft.updatedAt)}
              </p>
            </div>
            <Link
              href={`/dsr/new?siteId=${draft.site.id}&date=${draft.reportDate.slice(0, 10)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Continue
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              isLoading={discardingId === draft.id}
              onClick={() => handleDiscard(draft.id, draft.site.name)}
              aria-label={`Discard draft for ${draft.site.name}`}
            >
              <XIcon className="size-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
