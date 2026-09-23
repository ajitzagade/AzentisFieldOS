"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowsIcon, Button, useToast } from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { useClientValidation } from "@/lib/use-client-validation";
import type { SiteOption } from "../../../_components/site-field";
import { parseReassignSiteDateForm } from "../reassign-parse";
import { reassignDsrSiteDateAction } from "../reassign-actions";
import { ReassignSiteDateModal } from "./reassign-site-date-modal";

export interface ReassignSiteDateTriggerProps {
  dsrId: string;
  currentSiteId: string;
  /** YYYY-MM-DD */
  currentReportDate: string;
}

// spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" — a narrow,
// sanctioned AD-9 exception (same class as D7's Purchase-pricing
// completion, AGENTS.md). The Daily Report detail page (a server component)
// renders this only when the caller is Owner/Admin AND the report has no
// correction history (correctsId and correctedById both null) — that gate
// lives in page.tsx, not here; this component assumes it's already allowed
// to render. Owns everything the modal itself stays free of: open state,
// the on-open Site fetch (this page has no other reason to fetch Sites, so
// — same reasoning as AdvanceQuickEntryTrigger's on-open Team Member fetch
// — it's fetched lazily here rather than unconditionally in the server
// component), the bound non-redirecting Server Action, client validation
// (AD-7), and the success toast + router.refresh() (this page's data is
// server-fetched, so a refresh is required to show the report at its new
// Site/date without a full navigation — the report keeps the same id/URL).
export function ReassignSiteDateTrigger({
  dsrId,
  currentSiteId,
  currentReportDate,
}: ReassignSiteDateTriggerProps) {
  const [open, setOpen] = useState(false);
  // Bumped every time the modal is freshly opened so it remounts
  // (key={formKey}) — useActionState's internal state otherwise outlives a
  // close/reopen cycle and would show a stale result on reopen.
  const [formKey, setFormKey] = useState(0);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);

  const authedFetch = useAuthedFetch();
  const toast = useToast();
  const router = useRouter();
  const validation = useClientValidation(parseReassignSiteDateForm);

  const loadSites = useCallback(
    async (signal: AbortSignal) => {
      setSitesLoading(true);
      setSitesError(null);
      try {
        const res = await authedFetch("/sites", { signal });
        if (!res.ok) throw new Error(`Failed to load Sites (${res.status})`);
        const data: unknown = await res.json();
        // A 2xx with a malformed (non-array) body must not reach
        // sites.map() in the modal as a crash — degrade to the same
        // inline error state a network/HTTP failure shows.
        if (!Array.isArray(data)) throw new Error("Malformed Sites response");
        if (!signal.aborted) setSites(data as SiteOption[]);
      } catch {
        if (!signal.aborted) setSitesError("Couldn't load Sites");
      } finally {
        if (!signal.aborted) setSitesLoading(false);
      }
    },
    [authedFetch],
  );

  // Fetches only while the modal is open, and aborts on close — same
  // convention as AdvanceQuickEntryTrigger.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors advance-quick-entry-trigger.tsx
    loadSites(controller.signal);
    return () => controller.abort();
  }, [open, loadSites]);

  const openedFromRef = useRef(0);
  function handleOpen() {
    openedFromRef.current += 1;
    setFormKey(openedFromRef.current);
    setOpen(true);
  }

  const boundAction = reassignDsrSiteDateAction.bind(null, dsrId);

  return (
    <>
      <Button type="button" variant="ghost" onClick={handleOpen}>
        <ArrowsIcon className="size-4" />
        Reassign Site/Date
      </Button>
      <ReassignSiteDateModal
        key={formKey}
        open={open}
        onOpenChange={setOpen}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        currentSiteId={currentSiteId}
        currentReportDate={currentReportDate}
        action={boundAction}
        onSubmit={validation.guard()}
        validationErrors={validation.errors}
        onSuccess={() => {
          toast.success("Report reassigned");
          setOpen(false);
          // This page's Site/date were read server-side at request time —
          // refresh so it reflects the reassignment just recorded, without
          // a full navigation (the report keeps the same id/URL).
          router.refresh();
        }}
      />
    </>
  );
}
