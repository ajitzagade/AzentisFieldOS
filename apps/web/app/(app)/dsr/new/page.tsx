"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AmountField,
  Badge,
  Button,
  CalendarIcon,
  CameraIcon,
  Card,
  CheckCircleIcon,
  ComboboxField,
  ConfirmDialog,
  ConfirmDialogRow,
  PhotoThumbnail,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TextareaField,
  TrashIcon,
  TruckIcon,
  UserIcon,
  WifiOffIcon,
} from "@azentisfieldos/ui";
import { SiteField } from "../../_components/site-field";
import { dsrEquipmentUsedSchema, type CreateDsrInput } from "@azentisfieldos/shared";
import {
  clearDsrAutosave,
  loadDsrAutosave,
  loadMostRecentDsrAutosave,
  saveDsrAutosave,
} from "../../../../lib/dsr-autosave";
import { isQueued, localDsrKey, queueDsr, withClientGeneratedIds } from "../../../../lib/offline-db";
import { syncQueuedDsrs } from "../../../../lib/dsr-sync";
import { uploadPhoto } from "../../../../lib/photo-upload";
import { useAuthedFetch } from "../../../../lib/use-authed-fetch";
import { useDsrReferenceData } from "../../../../lib/use-dsr-reference-data";
import { stockStatus, useGodownStock, useOtherSiteStockMap, useSiteStock, withStockMeta } from "../../../../lib/use-site-stock";
import { MaterialQuickCreateModal } from "../../materials/_components/material-quick-create-modal";
import { TeamMemberQuickCreateModal } from "../../team/_components/team-member-quick-create-modal";
import { VendorQuickCreateModal } from "../../vendors/_components/vendor-quick-create-modal";
import { VehicleQuickCreateModal } from "../../machinery-vehicles/vehicles/_components/vehicle-quick-create-modal";
import { SubcontractorQuickCreateModal } from "../../subcontractors/_components/subcontractor-quick-create-modal";
import { DailyLabourerQuickCreateModal } from "../../labour-payments/_components/daily-labourer-quick-create-modal";

interface SiteOption {
  id: string;
  name: string;
}

interface CrewRow {
  teamMemberId: string;
  name?: string;
  attended: boolean;
}

interface ConsumptionRow {
  clientGeneratedId: string;
  materialSizeId: string | null;
  quantity: string;
  activityReference: string;
}

interface RmcRow {
  clientGeneratedId: string;
  vendorId: string | null;
  quantityM3: string;
  grade: string;
  ratePerM3: string;
}

interface ExpenseRow {
  clientGeneratedId: string;
  categoryId: string | null;
  amount: string;
  description: string;
}

interface EquipmentRow {
  type: "MACHINERY" | "VEHICLE" | "OTHER";
  // Present for MACHINERY/VEHICLE (a register id); a client-only random id
  // for OTHER rows (React key / remove-matching only — never resolved
  // against the Vehicle register, goal 2).
  id: string;
  name: string;
  // Optional per-row note (goal 5); the OTHER variant's free-text vehicle
  // description lives here too instead of a separate field.
  description?: string;
}

interface SubcontractorRow {
  clientGeneratedId: string;
  subcontractorId: string | null;
  workNote: string;
  // spec-dsr-activity-sync-detail-panel (goal 4): both ADDITIVE and OPTIONAL
  // — an entry with neither stays exactly as informational-JSON-only as
  // before. Only when both are present does dsr.service.ts create a real
  // SubcontractorWorkEntry against the picked Site Contract.
  siteContractId: string | null;
  quantity: string;
}

// A Site's Active, non-FIXED_COST Site Contracts, for the optional picker on
// each Subcontractor row (goal 4). FIXED_COST is filtered client-side (a
// FIXED_COST contract + quantity fails the whole DSR submission server-side)
// — best-effort per the spec's own "don't over-engineer this" note; the
// server remains the authoritative enforcement point regardless.
interface SiteContractOption {
  id: string;
  subcontractorId: string;
  workCategory: string | null;
  rateType: string;
  subcontractor: { name: string };
}

// spec-dsr-activity-sync-detail-panel (goal 3): a DSR-embedded Waste
// Material trip — structurally the same repeatable-row shape as RmcRow,
// with the OWN/HIRED-branching field set from waste-disposal-form.tsx minus
// the advance sub-flow (explicit "Never" boundary — that stays a
// standalone-module-only concept).
interface WasteRow {
  clientGeneratedId: string;
  wasteType: string;
  quantityDetails: string;
  ownership: "OWN" | "HIRED";
  vendorId: string | null;
  // Combines the Machinery/Vehicle registers into one picker value, same
  // "type:id" convention as the equipmentUsed picker — "" when neither
  // register supplies the asset (a Vendor-only or free-text-only trip).
  equipmentValue: string;
  vehicleDetails: string;
  tripCount: string;
  ratePerTrip: string;
  otherCharges: string;
  // "" until a rate is entered (D7 pattern) — never defaults to a real
  // status while pricing is unknown.
  paymentStatus: string;
  disposalLocation: string;
  notes: string;
}

// Same predicate buildPayload's own filter uses — shared so the "N entries"
// confirm-dialog count and what actually submits can never drift apart.
function isWasteRowComplete(row: WasteRow): boolean {
  return (
    row.wasteType.trim() !== "" &&
    row.tripCount.trim() !== "" &&
    Number(row.tripCount) > 0 &&
    (row.ownership === "OWN" || !!row.vendorId)
  );
}

// Review fix (finding #10): the same client-side completeness/positivity
// gating isWasteRowComplete/other numeric DSR row fields already have —
// z.number().positive() is enforced server-side only otherwise, so a
// 0/negative quantity previously failed the WHOLE DSR submission late
// with no inline warning. A siteContractId with an invalid quantity falls
// back to informational-only (matches the "both stay additive/optional"
// rule) rather than being sent to the server as a real link.
function isSubcontractorLinkValid(row: SubcontractorRow): boolean {
  return !!row.siteContractId && row.quantity.trim() !== "" && Number(row.quantity) > 0;
}

// spec-dsr-labour-dropdown: one row = one named Labourer picked from the
// DailyLabourer registry — no headcount field, multiple people are multiple
// rows. Replaces the old free-text category + men/women tally (legacy rows
// stay valid server-side via dsrLabourEntrySchema's union, but this form
// only ever produces the new shape).
interface LabourRow {
  clientGeneratedId: string;
  labourerId: string | null;
}

// The shared schema (AD-7) is the one place "a description is required for
// Other Vehicle" is defined — reused here instead of leaning on the native
// `required` attribute alone, which a whitespace-only value slips past
// (finding: OTHER row's description had no inline error, unlike a proper
// AD-7-wired field).
function equipmentDescriptionError(row: { type: EquipmentRow["type"]; description?: string }): string | undefined {
  const result = dsrEquipmentUsedSchema.safeParse(row);
  if (result.success) return undefined;
  return result.error.flatten().fieldErrors.description?.[0];
}

interface PhotoItem {
  localId: string;
  // Absent for a photo resumed from a saved draft — it already lives on the
  // server (attached to the draft row), so there is nothing to (re-)upload.
  file?: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
}

// spec-dsr-drafts: the resume payload from GET /dsr/draft — narrative +
// equipmentUsed from columns, sub-records rehydrated from draftContent, plus
// any photos already attached to the draft row (gallery-hidden until Finalize).
interface DraftResponse {
  id: string;
  siteId: string;
  reportDate: string;
  workCompleted: string | null;
  issuesBlockers: string | null;
  workRecords: { teamMemberId: string; attended: boolean }[];
  consumptions: {
    clientGeneratedId?: string;
    materialSizeId: string;
    quantity: number;
    activityReference?: string;
  }[];
  rmcEntries: {
    clientGeneratedId?: string;
    vendorId: string;
    quantityM3: number;
    grade: string;
    // Nullable (goal 1) — a delivery may be recorded before pricing exists.
    ratePerM3: number | null;
  }[];
  expenses: { clientGeneratedId?: string; categoryId: string; amount: number; description?: string }[];
  equipmentUsed: EquipmentRow[];
  subcontractorEntries: {
    clientGeneratedId?: string;
    subcontractorId: string;
    workNote?: string;
    // goal 4: additive/optional — absent on every historical draft.
    siteContractId?: string;
    quantity?: number;
  }[];
  // spec-dsr-labour-dropdown: a resumed draft may carry either shape — a
  // draft saved before this change (legacy free-text category/men/women)
  // or after it (labourerId). Only the new shape is representable in this
  // form's picker-only UI; the resume mapping below drops any legacy row
  // (it stays exactly as saved on the draft's own draftContent JSON either
  // way — never rewritten, AD-9).
  labourEntries: (
    | { clientGeneratedId?: string; labourerId: string }
    | { clientGeneratedId?: string; category: string; men: number; women: number }
  )[];
  // goal 3: dsr.service.ts's draftSubRecords()/getDraft() defer
  // wasteDisposalEntries through the Save Draft/Resume round trip exactly
  // like workRecords/consumptions/rmcEntries/expenses do — a Waste
  // Material row typed before Save Draft survives save -> resume ->
  // Finalize (see dsr.service.integration.spec.ts's own test for this).
  // The `?? []` fallback below is still defensive against a historical
  // draft saved before this field existed.
  wasteDisposalEntries: {
    clientGeneratedId?: string;
    wasteType: string;
    quantityDetails?: string;
    ownership: "OWN" | "HIRED";
    vendorId?: string;
    machineryId?: string;
    vehicleId?: string;
    vehicleDetails?: string;
    tripCount: number;
    ratePerTrip?: number | null;
    otherCharges?: number | null;
    paymentStatus?: string | null;
    disposalLocation?: string;
    notes?: string;
  }[];
  photos: { id: string; url: string }[];
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// The continuously-autosaved in-progress form state (lib/dsr-autosave.ts) —
// everything the Supervisor has typed, minus photos (File objects can't be
// serialized; `hadPhotos` lets the restore banner say so honestly).
interface DsrAutosaveData {
  siteId: string;
  reportDate: string;
  workCompleted: string;
  issuesBlockers: string;
  crew: CrewRow[];
  consumptions: ConsumptionRow[];
  rmcEntries: RmcRow[];
  expenses: ExpenseRow[];
  equipmentUsed: EquipmentRow[];
  subcontractorEntries: SubcontractorRow[];
  labourEntries: LabourRow[];
  wasteEntries: WasteRow[];
  hadPhotos: boolean;
}

// Mobile Site Supervisor DSR entry (FR-28). Every reference field —
// Material, crew member, RMC Vendor, Expense Category, equipment — is a
// searchable picker over the real master-data list endpoints (Epics
// 4/6/8/9/11), so the Supervisor types a name fragment and selects; the
// internal id is carried, never shown or typed. Rows carry their
// clientGeneratedId from the moment they're added (AD-8), so a re-submit
// — online double-tap or offline-queue retry — upserts the same
// sub-records instead of duplicating them.
function NewDsrForm() {
  const authedFetch = useAuthedFetch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sites, setSites] = useState<SiteOption[]>([]);
  // Site detail's "Today's DSR" action deep-links here with ?siteId= so
  // the Site arrives pre-selected (Site → Today's DSR → report).
  const [siteId, setSiteId] = useState(() => searchParams.get("siteId") ?? "");
  // "My Drafts" quick-resume (2026-09-21) deep-links here with ?date= too —
  // a Resume link must land on the DRAFT's own date, not today's, or the
  // draft-lookup effect below (keyed on siteId+reportDate) would silently
  // miss it and the user would see a blank form instead of their draft.
  // Loosely validated (YYYY-MM-DD) so a malformed/hand-edited URL degrades
  // to today rather than an Invalid Date reaching the server.
  const [reportDate, setReportDate] = useState(() => {
    const deepLinkedDate = searchParams.get("date");
    return deepLinkedDate && /^\d{4}-\d{2}-\d{2}$/.test(deepLinkedDate) ? deepLinkedDate : todayDate();
  });
  const [workCompleted, setWorkCompleted] = useState("");
  const [issuesBlockers, setIssuesBlockers] = useState("");

  const reference = useDsrReferenceData();
  // FR-14: what's actually on hand at the selected Site, shown inside the
  // Material picker and under each selected Material — the Supervisor
  // sees "80 Bags available" before the stock-safety check would reject.
  const siteStock = useSiteStock(siteId);
  // A Material with real Godown balance that was simply never moved/
  // purchased to this Site would otherwise show a bare "No stock" —
  // indistinguishable from not existing at all. Godown is checked as the
  // "where else is it" reference (real end-to-end report, 2026-09-22).
  const godownStock = useGodownStock();
  const elsewhereGodown = { label: "Godown", stock: godownStock };
  const materialOptions = useMemo(
    () => (siteId ? withStockMeta(reference.materialOptions, siteStock, elsewhereGodown) : reference.materialOptions),
    [reference.materialOptions, siteId, siteStock, godownStock],
  );

  const [crew, setCrew] = useState<CrewRow[]>([]);
  const [newCrewId, setNewCrewId] = useState<string | null>(null);
  const [teamMemberQuickCreateOpen, setTeamMemberQuickCreateOpen] = useState(false);
  // Consumption/RMC rows each have their own Material/Vendor picker — the
  // quick-create modal is shared, so it tracks which row's picker opened it.
  const [materialQuickCreateRow, setMaterialQuickCreateRow] = useState<number | null>(null);
  const [vendorQuickCreateRow, setVendorQuickCreateRow] = useState<number | null>(null);
  const [vehicleQuickCreateOpen, setVehicleQuickCreateOpen] = useState(false);

  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>([]);
  // Informational-only "where else is this Material" — see
  // useOtherSiteStockMap's own comment. Called once here (not inside the
  // per-row render loop below) with every row's materialSizeId, looked up
  // per row with a plain Map.get() during render.
  const otherSiteStock = useOtherSiteStockMap(
    consumptions.map((c) => c.materialSizeId),
    siteId,
  );
  const [rmcEntries, setRmcEntries] = useState<RmcRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentRow[]>([]);
  const [newEquipmentId, setNewEquipmentId] = useState<string | null>(null);
  const [subcontractorEntries, setSubcontractorEntries] = useState<SubcontractorRow[]>([]);
  const [subcontractorQuickCreateRow, setSubcontractorQuickCreateRow] = useState<number | null>(null);
  const [labourEntries, setLabourEntries] = useState<LabourRow[]>([]);
  const [labourerQuickCreateRow, setLabourerQuickCreateRow] = useState<number | null>(null);
  const [wasteEntries, setWasteEntries] = useState<WasteRow[]>([]);

  // goal 4: this Site's Active, non-FIXED_COST Site Contracts, for the
  // optional picker on each Subcontractor row. Keyed on siteId and shared
  // across every row, the same "one fetch per Site" pattern useSiteStock
  // uses (state keyed by siteId, compared against the current siteId when
  // read — never an eager synchronous reset inside the effect) — not part
  // of useDsrReferenceData since that hook loads once, globally, with no
  // Site scoping.
  const [siteContractState, setSiteContractState] = useState<{ siteId: string; options: SiteContractOption[] } | null>(
    null,
  );
  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    authedFetch(`/site-contracts?siteId=${siteId}&status=ACTIVE`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((data: SiteContractOption[]) => {
        if (cancelled) return;
        setSiteContractState({ siteId, options: Array.isArray(data) ? data.filter((c) => c.rateType !== "FIXED_COST") : [] });
      })
      .catch(() => {
        if (!cancelled) setSiteContractState({ siteId, options: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, authedFetch]);
  // Review fix (finding #5): scoped per-row to the row's OWN picked
  // Subcontractor — a flat, Site-wide list let a user pick Subcontractor A
  // in one field and materialize the ledger entry against Subcontractor
  // B's contract in the sibling field. A row with no Subcontractor picked
  // yet sees every Active contract for the Site (nothing to narrow by).
  function siteContractOptionsFor(row: SubcontractorRow) {
    const options = siteContractState?.siteId === siteId ? siteContractState.options : [];
    return options
      .filter((c) => !row.subcontractorId || c.subcontractorId === row.subcontractorId)
      .map((c) => ({
        value: c.id,
        label: `${c.subcontractor.name} — ${c.workCategory ?? "General"}`,
      }));
  }
  // Waste Material's "Own machinery / vehicle" picker (goal 3) reuses the
  // same Machinery+Vehicle registers equipmentUsed already loads, minus the
  // synthetic "Other Vehicle" entry — WasteDisposal has its own free-text
  // vehicleDetails field for that case, never resolved against a register.
  const machineryVehicleOptions = useMemo(
    () => reference.equipmentOptions.filter((o) => o.equipmentType !== "OTHER"),
    [reference.equipmentOptions],
  );

  // FR-30: photos are staged locally as they're captured (like every other
  // field) and uploaded once the DSR itself has synced and has a real id —
  // never eagerly against a not-yet-submitted DSR, since the sub-record
  // upsert loops (story 3.2) tolerate an empty array on re-submission but
  // the DSR's own `equipmentUsed` JSON column does not: an eager "ensure
  // this DSR exists" call with empty defaults would silently wipe an
  // already-synced report's equipment tags. Story 3.2's offline queue
  // doesn't carry photo bytes — if the submission itself queues offline,
  // staged photos stay pending until the Supervisor is back online and
  // resubmits with this page still open (see Completion Notes).
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [dailySiteReportId, setDailySiteReportId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // spec-dsr-photo-management: a resumed draft's already-uploaded photos
  // (draft.photos) — tracked separately from `photos` above (which only
  // ever holds THIS session's staged/newly-captured files) so Remove on one
  // of these can call the real soft-delete endpoint immediately instead of
  // just hiding it locally while the Photo row stays attached server-side.
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string }[]>([]);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);

  // spec-dsr-drafts: the id of the persisted DRAFT for the current
  // (site,date), set once Save Draft succeeds or an existing draft is resumed
  // on mount. Its presence flips the primary action from the one-shot
  // "Submit Daily Report" to "Finalize Report" (+ Discard), since a one-shot
  // submit alongside a live draft would create a duplicate SUBMITTED row.
  // Declared above the render-phase reset below, which clears it on a
  // site/date change.
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  // Review item 11: true when the form was pre-filled from a resumed draft, so
  // a banner can tell the Supervisor they're continuing saved work, not
  // starting fresh. Review item 7: Discard runs behind a confirm and is
  // disabled while its DELETE is in flight (no double-delete).
  const [isResumedDraft, setIsResumedDraft] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // A staged photo belongs to whichever Site/date it was captured under —
  // changing either invalidates the DSR id photos would otherwise upload
  // against, so start over rather than risk attaching a photo to the wrong
  // report. Adjusted during render (React's documented pattern for
  // resetting state when a derived key changes) rather than in an effect,
  // which would cause an extra visible render of the stale photo list.
  const [photoResetKey, setPhotoResetKey] = useState(() => localDsrKey(siteId, reportDate));
  const submissionKey = localDsrKey(siteId, reportDate);
  if (submissionKey !== photoResetKey) {
    setPhotoResetKey(submissionKey);
    setPhotos([]);
    setExistingPhotos([]);
    setDailySiteReportId(null);
    // The draft is keyed per (site,date) too — the resume effect below
    // re-resolves it for the newly-picked pair.
    setDraftId(null);
    setDraftSaved(false);
    setIsResumedDraft(false);
  }

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // AC #1/#2: "queued" = saved on device, waiting for connectivity;
  // "synced" = confirmed landed on the server. Never a single ambiguous
  // pending spinner (EXPERIENCE.md).
  const [syncState, setSyncState] = useState<"queued" | "synced" | null>(null);
  // Set only by doSubmit's own online-success branch (never the offline
  // queued branches, and never handleFinalize — that path already awaits
  // every photo upload before it reaches its own success state, so it
  // navigates immediately with no need to wait). Mirrors
  // dsr-desktop-form.tsx's `submittedDsrId`-gated redirect effect, but kept
  // as its own flag rather than reusing `syncState` directly so the
  // background queue-drain effect below (which can also flip `syncState` to
  // "synced" later, well after the user has moved on from that submission)
  // can never accidentally trigger this navigation too.
  const [awaitingUploadsBeforeNav, setAwaitingUploadsBeforeNav] = useState(false);

  // Autosave restore (lib/dsr-autosave.ts): non-null once this mount
  // restored an interrupted session's entries, driving the restore banner.
  const [restoredAutosaveAt, setRestoredAutosaveAt] = useState<number | null>(null);
  const [restoredHadPhotos, setRestoredHadPhotos] = useState(false);
  // Gates the draft-resume effect below: the restore decision must land
  // first, or its async crew-defaults fetch could clobber restored crew.
  const [autosaveChecked, setAutosaveChecked] = useState(false);
  // Set when a restore just applied — the next crew-defaults fetch is
  // skipped once so it can't overwrite the restored checklist.
  const skipCrewDefaultsOnceRef = useRef(false);
  // True once THIS session wrote a snapshot — lets the writer effect clear
  // the snapshot when the user deliberately empties the form, without a
  // fresh empty mount ever clearing another session's un-restored snapshot
  // (e.g. after a deep-link to a different Site skipped the restore).
  const hasWrittenAutosaveRef = useRef(false);

  // FR-54-adjacent re-verification: both ways a report leaves this form
  // (one-shot Submit, draft Finalize) are held behind one ConfirmDialog
  // that plays the entered details back before anything posts.
  const [confirmAction, setConfirmAction] = useState<"submit" | "finalize" | null>(null);

  const currentKeyRef = useRef(localDsrKey(siteId, reportDate));

  // Client-readiness batch (goal 8): shared by the mount-time restore below
  // AND the per-Site/Date-change effect further down, so "restore this
  // pair's autosaved data" is one code path, not two that could drift.
  function applyAutosaveSnapshot(d: DsrAutosaveData, savedAt: number) {
    setWorkCompleted(d.workCompleted ?? "");
    setIssuesBlockers(d.issuesBlockers ?? "");
    setCrew(Array.isArray(d.crew) ? d.crew : []);
    setConsumptions(Array.isArray(d.consumptions) ? d.consumptions : []);
    setRmcEntries(Array.isArray(d.rmcEntries) ? d.rmcEntries : []);
    setExpenses(Array.isArray(d.expenses) ? d.expenses : []);
    setEquipmentUsed(Array.isArray(d.equipmentUsed) ? d.equipmentUsed : []);
    setSubcontractorEntries(Array.isArray(d.subcontractorEntries) ? d.subcontractorEntries : []);
    setLabourEntries(Array.isArray(d.labourEntries) ? d.labourEntries : []);
    setWasteEntries(Array.isArray(d.wasteEntries) ? d.wasteEntries : []);
    setRestoredHadPhotos(Boolean(d.hadPhotos));
    setRestoredAutosaveAt(savedAt);
  }

  // Restore an interrupted session once per mount, before the draft-resume
  // effect below is allowed to run. A deep-linked ?siteId= for a DIFFERENT
  // Site is an explicit navigation intent — don't hijack it with a restore.
  // Synchronous setState in a mount effect is deliberate here: the snapshot
  // must NOT feed useState initializers ("use client" pages still server-
  // render; localStorage-derived initial state would hydration-mismatch),
  // and the one cascading re-render it triggers is the restore itself.
  // Client-readiness batch (goal 8): autosave is now keyed per (siteId,
  // reportDate) — at mount there's no pair yet to key off (the whole point
  // is discovering which one), so this scans every stored pair for the most
  // recently written one via loadMostRecentDsrAutosave. Once a pair is
  // known, every later read goes through the keyed lookup in the
  // Site/Date-change effect below, so switching between two already-known
  // pairs never cross-contaminates.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (autosaveChecked) return;
    const snapshot = loadMostRecentDsrAutosave<DsrAutosaveData>();
    const deepLinkedSiteId = searchParams.get("siteId");
    // "My Drafts" quick-resume (2026-09-21): same guard, extended to date —
    // a stale local autosave snapshot for the same Site but a DIFFERENT date
    // must not silently override an explicitly deep-linked ?date= (the
    // server DRAFT lookup below is keyed on the deep-linked pair; letting
    // the snapshot win here would resume the wrong day's draft).
    const deepLinkedDate = searchParams.get("date");
    // Review fix (simplification scan): one named predicate instead of two
    // copy-pasted `!param || param === value` clauses.
    const matchesDeepLink = (param: string | null, value: string) => !param || param === value;
    if (
      snapshot &&
      snapshot.data.siteId &&
      matchesDeepLink(deepLinkedSiteId, snapshot.data.siteId) &&
      matchesDeepLink(deepLinkedDate, snapshot.data.reportDate)
    ) {
      const d = snapshot.data;
      setSiteId(d.siteId);
      if (d.reportDate) setReportDate(d.reportDate);
      applyAutosaveSnapshot(d, snapshot.savedAt);
      skipCrewDefaultsOnceRef.current = true;
    }
    setAutosaveChecked(true);
  }, [autosaveChecked, searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Continuously snapshot what's typed (debounced) so an accidental app
  // close mid-entry never costs the Supervisor their entries. Deliberately
  // NOT dirty on crew alone — the checklist is auto-prefilled from the
  // Site's last attendance, and snapshotting that would "restore" sessions
  // the user never typed into. Skipped once the report has reached a
  // durable home (submitted/queued — those paths also clear the snapshot).
  useEffect(() => {
    if (!autosaveChecked || !siteId || syncState !== null) return;
    if (isSubmitting || isSavingDraft || isDiscarding) return;
    const hasContent =
      workCompleted !== "" ||
      issuesBlockers !== "" ||
      consumptions.length > 0 ||
      rmcEntries.length > 0 ||
      expenses.length > 0 ||
      equipmentUsed.length > 0 ||
      subcontractorEntries.length > 0 ||
      labourEntries.length > 0 ||
      wasteEntries.length > 0;
    if (!hasContent) {
      // The user deliberately emptied a form this session had snapshotted
      // (or restored) — a kept snapshot would resurrect the deleted
      // entries on the next visit.
      if (hasWrittenAutosaveRef.current || restoredAutosaveAt !== null) {
        clearDsrAutosave(siteId, reportDate);
        hasWrittenAutosaveRef.current = false;
      }
      return;
    }
    const timer = setTimeout(() => {
      hasWrittenAutosaveRef.current = true;
      saveDsrAutosave<DsrAutosaveData>(siteId, reportDate, {
        siteId,
        reportDate,
        workCompleted,
        issuesBlockers,
        crew,
        consumptions,
        rmcEntries,
        expenses,
        equipmentUsed,
        subcontractorEntries,
        labourEntries,
        wasteEntries,
        hadPhotos: photos.some((p) => p.file),
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [
    autosaveChecked,
    siteId,
    reportDate,
    workCompleted,
    issuesBlockers,
    crew,
    consumptions,
    rmcEntries,
    expenses,
    equipmentUsed,
    subcontractorEntries,
    labourEntries,
    wasteEntries,
    photos,
    syncState,
    isSubmitting,
    isSavingDraft,
    isDiscarding,
    restoredAutosaveAt,
  ]);

  useEffect(() => {
    authedFetch(`/sites`)
      .then((res) => res.json())
      .then((data: SiteOption[]) => setSites(data))
      .catch(() => setSites([]));
  }, [authedFetch]);

  // Reflect whether the currently-selected Site/date already has a queued
  // (not-yet-synced) local entry — covers the Supervisor reopening the app
  // before it's had a chance to sync (EXPERIENCE.md flow 1, step 6).
  useEffect(() => {
    currentKeyRef.current = localDsrKey(siteId, reportDate);
    if (!siteId || !reportDate) {
      return;
    }
    let cancelled = false;
    isQueued(siteId, reportDate).then((queued) => {
      if (!cancelled) setSyncState(queued ? "queued" : null);
    });
    return () => {
      cancelled = true;
    };
  }, [siteId, reportDate]);

  // Task 3: drain the local queue whenever connectivity returns, and poll
  // as a fallback since mobile browsers don't always fire `online`
  // reliably. Silent on success — no dialog, no navigation change.
  useEffect(() => {
    const trigger = () => {
      syncQueuedDsrs(authedFetch, (localKey) => {
        if (localKey === currentKeyRef.current) setSyncState("synced");
      });
    };

    trigger();
    window.addEventListener("online", trigger);
    const interval = setInterval(trigger, 20000);

    return () => {
      window.removeEventListener("online", trigger);
      clearInterval(interval);
    };
  }, [authedFetch]);

  // spec-dsr-drafts: rehydrate the form from a resumed draft. Crew names
  // aren't stored in draftContent, so they're re-resolved from the loaded
  // reference data (falling back to a generic label until it arrives).
  // Declared before the resume effect that calls it (React-compiler lint).
  function prefillFromDraft(draft: DraftResponse) {
    // The server-side draft is the authoritative resume source — a
    // coexisting autosave snapshot would show two conflicting "restored"
    // banners, so the snapshot (at most the post-last-save delta) yields.
    if (restoredAutosaveAt !== null) {
      setRestoredAutosaveAt(null);
      setRestoredHadPhotos(false);
    }
    clearDsrAutosave(draft.siteId, draft.reportDate);
    setDraftId(draft.id);
    setIsResumedDraft(true);
    setDailySiteReportId(draft.id);
    setDraftSaved(false);
    setWorkCompleted(draft.workCompleted ?? "");
    setIssuesBlockers(draft.issuesBlockers ?? "");
    setCrew(
      draft.workRecords.map((w) => ({
        teamMemberId: w.teamMemberId,
        name: reference.teamMemberOptions.find((o) => o.value === w.teamMemberId)?.label,
        attended: w.attended,
      })),
    );
    setConsumptions(
      draft.consumptions.map((c) => ({
        clientGeneratedId: c.clientGeneratedId ?? crypto.randomUUID(),
        materialSizeId: c.materialSizeId,
        quantity: String(c.quantity),
        activityReference: c.activityReference ?? "",
      })),
    );
    setRmcEntries(
      draft.rmcEntries.map((r) => ({
        clientGeneratedId: r.clientGeneratedId ?? crypto.randomUUID(),
        vendorId: r.vendorId,
        quantityM3: String(r.quantityM3),
        grade: r.grade,
        ratePerM3: r.ratePerM3 != null ? String(r.ratePerM3) : "",
      })),
    );
    setExpenses(
      draft.expenses.map((e) => ({
        clientGeneratedId: e.clientGeneratedId ?? crypto.randomUUID(),
        categoryId: e.categoryId,
        amount: String(e.amount),
        description: e.description ?? "",
      })),
    );
    setEquipmentUsed(draft.equipmentUsed ?? []);
    setSubcontractorEntries(
      (draft.subcontractorEntries ?? []).map((s) => ({
        clientGeneratedId: s.clientGeneratedId ?? crypto.randomUUID(),
        subcontractorId: s.subcontractorId,
        workNote: s.workNote ?? "",
        siteContractId: s.siteContractId ?? null,
        quantity: s.quantity != null ? String(s.quantity) : "",
      })),
    );
    // spec-dsr-labour-dropdown: only rows already in the new {labourerId}
    // shape are representable in this form's picker-only UI — a legacy
    // {category, men, women} row saved on this draft before this change
    // stays exactly as-is in draftContent (never rewritten, AD-9), just not
    // reproducible here.
    setLabourEntries(
      (draft.labourEntries ?? [])
        .filter((l): l is { clientGeneratedId?: string; labourerId: string } => "labourerId" in l)
        .map((l) => ({
          clientGeneratedId: l.clientGeneratedId ?? crypto.randomUUID(),
          labourerId: l.labourerId,
        })),
    );
    // goal 3: see DraftResponse's own comment — always [] against today's
    // backend, wired the same defensive way as every sibling array here so
    // it starts working the moment the draft round trip picks it up.
    setWasteEntries(
      (draft.wasteDisposalEntries ?? []).map((w) => ({
        clientGeneratedId: w.clientGeneratedId ?? crypto.randomUUID(),
        wasteType: w.wasteType,
        quantityDetails: w.quantityDetails ?? "",
        ownership: w.ownership,
        vendorId: w.vendorId ?? null,
        equipmentValue: w.machineryId ? `machinery:${w.machineryId}` : w.vehicleId ? `vehicle:${w.vehicleId}` : "",
        vehicleDetails: w.vehicleDetails ?? "",
        tripCount: String(w.tripCount),
        ratePerTrip: w.ratePerTrip != null ? String(w.ratePerTrip) : "",
        otherCharges: w.otherCharges != null ? String(w.otherCharges) : "",
        paymentStatus: w.paymentStatus ?? "",
        disposalLocation: w.disposalLocation ?? "",
        notes: w.notes ?? "",
      })),
    );
    // spec-dsr-photo-management: rendered/removed separately from `photos`
    // (new-this-session staged uploads) — see existingPhotos's own comment.
    setExistingPhotos(draft.photos);
  }

  // spec-dsr-drafts: on picking a (site,date), first try to resume a persisted
  // DRAFT for that pair — pre-filling the whole form (narrative + sub-records
  // + already-attached photos) so re-entry can't double-count. Only when no
  // draft exists do we fall back to AC #1's crew checklist pre-populated from
  // the Site's most recent prior attendance ("yesterday" = last day this Site
  // had any, not date - 1). One effect, so the crew-defaults fetch can never
  // clobber a resumed draft's crew.
  useEffect(() => {
    // Wait for the autosave-restore decision — it may be about to change
    // (site, date) and restore a crew checklist this fetch must not clobber.
    if (!autosaveChecked) return;
    if (!siteId || !reportDate) return;
    let cancelled = false;
    // Consumed synchronously at effect entry (not inside the async flow) so
    // it can only ever apply to the run immediately following the restore,
    // never leak into a later site/date change.
    const skipCrewDefaults = skipCrewDefaultsOnceRef.current;
    skipCrewDefaultsOnceRef.current = false;

    (async () => {
      try {
        const res = await authedFetch(`/dsr/draft?siteId=${siteId}&date=${reportDate}`);
        if (res.ok) {
          const draft = (await res.json()) as DraftResponse | null;
          if (!cancelled && draft) {
            prefillFromDraft(draft);
            return;
          }
        }
      } catch {
        // Fall through to crew defaults — a draft-fetch failure must never
        // leave the form unusable.
      }
      if (cancelled) return;
      // A just-restored autosave session already carries its crew checklist
      // — skip the defaults exactly once so it isn't overwritten.
      if (skipCrewDefaults) return;

      // Client-readiness batch (goal 8): no server DRAFT for this pair —
      // this pair's own local autosave (if any) restores next, covering a
      // mid-session switch back to a Site+Date that has unsaved local
      // progress but no server draft. Checked AFTER the server draft (which
      // stays authoritative, per prefillFromDraft's own comment above).
      const localSnapshot = loadDsrAutosave<DsrAutosaveData>(siteId, reportDate);
      if (localSnapshot) {
        applyAutosaveSnapshot(localSnapshot.data, localSnapshot.savedAt);
        return;
      }

      // Client-readiness batch (goal 8): neither a server draft nor a local
      // snapshot exists for this pair — every field resets to blank/
      // defaults, not just crew, or stale state from whatever Site+Date was
      // previously being edited would otherwise bleed into this one.
      setRestoredAutosaveAt(null);
      setRestoredHadPhotos(false);
      setWorkCompleted("");
      setIssuesBlockers("");
      setConsumptions([]);
      setRmcEntries([]);
      setExpenses([]);
      setEquipmentUsed([]);
      setSubcontractorEntries([]);
      setLabourEntries([]);
      setWasteEntries([]);
      try {
        const res = await authedFetch(`/dsr/defaults?siteId=${siteId}&date=${reportDate}`);
        const defaults = (await res.json()) as { teamMemberId: string; name: string }[];
        if (!cancelled) {
          setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true })));
        }
      } catch {
        if (!cancelled) setCrew([]);
      }
    })();

    return () => {
      cancelled = true;
    };
    // prefillFromDraft is a stable closure over setters; intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveChecked, siteId, reportDate, authedFetch]);

  function toggleAttended(teamMemberId: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, attended: !r.attended } : r)));
  }

  // Goal 6: a crew member added by mistake (or who turns out not to be on
  // this report) can be removed before submitting — same "Remove" pattern
  // already used for Consumptions/RMC/Expenses rows.
  function removeCrewMember(teamMemberId: string) {
    setCrew((rows) => rows.filter((r) => r.teamMemberId !== teamMemberId));
  }

  function addCrewMember(teamMemberId: string | null) {
    setNewCrewId(teamMemberId);
    if (!teamMemberId) return;
    const option = reference.teamMemberOptions.find((o) => o.value === teamMemberId);
    setCrew((rows) =>
      rows.some((r) => r.teamMemberId === teamMemberId)
        ? rows
        : [...rows, { teamMemberId, name: option?.label, attended: true }],
    );
    // Selection consumed into the checklist — reset the picker for the
    // next crew member.
    setNewCrewId(null);
  }

  function addEquipment(optionValue: string | null) {
    setNewEquipmentId(optionValue);
    if (!optionValue) return;
    const option = reference.equipmentOptions.find((o) => o.value === optionValue);
    if (!option) return;
    if (option.equipmentType === "OTHER") {
      // Goal 2: no register id to resolve — a fresh free-text row the
      // Supervisor fills in below. The id here is a client-only key, never
      // looked up against the Vehicle register.
      setEquipmentUsed((rows) => [
        ...rows,
        { type: "OTHER", id: crypto.randomUUID(), name: "Other Vehicle", description: "" },
      ]);
      setNewEquipmentId(null);
      return;
    }
    const id = optionValue.split(":")[1] ?? optionValue;
    setEquipmentUsed((rows) =>
      rows.some((r) => r.id === id) ? rows : [...rows, { type: option.equipmentType, id, name: option.name }],
    );
    setNewEquipmentId(null);
  }

  function updateEquipmentDescription(id: string, description: string) {
    setEquipmentUsed((rows) => rows.map((r) => (r.id === id ? { ...r, description } : r)));
  }

  // Returns whether the upload landed — the caller (Finalize) needs to know so
  // it can abort rather than finalize a report whose photo never reached the
  // server (review item 7). The fire-and-forget callers ignore the result.
  async function uploadStagedPhoto(dsrId: string, localId: string, file: File): Promise<boolean> {
    setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "uploading" } : p)));
    try {
      await uploadPhoto(authedFetch, dsrId, file);
      setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "uploaded" } : p)));
      return true;
    } catch {
      setPhotos((rows) => rows.map((p) => (p.localId === localId ? { ...p, status: "failed" } : p)));
      return false;
    }
  }

  function handlePhotoCapture(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const newPhotos: PhotoItem[] = Array.from(fileList).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));
    setPhotos((rows) => [...rows, ...newPhotos]);

    // Already-synced DSR (e.g. adding a photo after Submit) — upload right
    // away instead of waiting for another Submit click.
    if (dailySiteReportId) {
      for (const photo of newPhotos) {
        if (photo.file) void uploadStagedPhoto(dailySiteReportId, photo.localId, photo.file);
      }
    }
  }

  function removePhoto(localId: string) {
    setPhotos((rows) => {
      const target = rows.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return rows.filter((p) => p.localId !== localId);
    });
  }

  // spec-dsr-photo-management: unlike removePhoto above (a local/not-yet-
  // confirmed File — safe to just drop), a resumed draft's already-uploaded
  // photo is a real Photo row. Removal is its own immediate soft-delete
  // request (mirrors the quick-create-modal's immediate-write pattern), not
  // deferred to Save Draft/Finalize.
  async function removeExistingPhoto(photoId: string) {
    if (removingPhotoId || !dailySiteReportId) return;
    setRemovingPhotoId(photoId);
    try {
      const res = await authedFetch(
        `/photos/${photoId}?dailySiteReportId=${encodeURIComponent(dailySiteReportId)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setExistingPhotos((rows) => rows.filter((p) => p.id !== photoId));
      } else {
        setError("Couldn't remove that photo. Please try again.");
      }
    } catch {
      setError("Couldn't remove that photo. Please try again.");
    } finally {
      setRemovingPhotoId(null);
    }
  }

  function retryPhoto(localId: string) {
    const photo = photos.find((p) => p.localId === localId);
    if (!photo || !photo.file || !dailySiteReportId) return;
    void uploadStagedPhoto(dailySiteReportId, photo.localId, photo.file);
  }

  // dsr-desktop-form.tsx's identical pattern: the one navigation point after
  // an online-synced one-shot Submit, deferred until no photo is left
  // "uploading" or "failed" (an empty/all-"uploaded" list passes trivially).
  // A photo staged here CAN be retried (see the "Retry" button in the Site
  // Photos section below) or removed — either resumes this effect, since
  // `.every()` re-evaluates against the freed-up array. Deliberately not
  // wired to the offline-queued branches (those never set
  // awaitingUploadsBeforeNav) or to handleFinalize (which navigates directly
  // below, having already awaited its own photo uploads).
  useEffect(() => {
    if (awaitingUploadsBeforeNav && photos.every((p) => p.status === "uploaded")) {
      router.push(`/daily-activity/history?flash=${encodeURIComponent("Daily Report submitted")}`);
    }
  }, [awaitingUploadsBeforeNav, photos, router]);

  // spec-dsr-drafts: the one construction of the report payload, shared by the
  // one-shot Submit, Save Draft, and Finalize. Only complete sub-record rows
  // are sent (a half-filled material row is dropped) — same rule the one-shot
  // submit always used, so a draft never persists an unmaterialisable row.
  function buildPayload(): CreateDsrInput {
    return withClientGeneratedIds({
      siteId,
      reportDate,
      workCompleted: workCompleted || undefined,
      issuesBlockers: issuesBlockers || undefined,
      workRecords: crew.map((c) => ({ teamMemberId: c.teamMemberId, attended: c.attended })),
      consumptions: consumptions
        .filter((c) => c.materialSizeId && c.quantity)
        .map((c) => ({
          clientGeneratedId: c.clientGeneratedId,
          materialSizeId: c.materialSizeId!,
          quantity: Number(c.quantity),
          activityReference: c.activityReference || undefined,
        })),
      // Goal 1: rate is optional — a blank ratePerM3 no longer drops the
      // row (it used to be part of this filter), it just submits without
      // one and the server stores totalAmount as null.
      rmcEntries: rmcEntries
        .filter((r) => r.vendorId && r.quantityM3 && r.grade)
        .map((r) => ({
          clientGeneratedId: r.clientGeneratedId,
          vendorId: r.vendorId!,
          quantityM3: Number(r.quantityM3),
          grade: r.grade,
          ratePerM3: r.ratePerM3 ? Number(r.ratePerM3) : undefined,
        })),
      expenses: expenses
        .filter((e) => e.categoryId && e.amount)
        .map((e) => ({
          clientGeneratedId: e.clientGeneratedId,
          categoryId: e.categoryId!,
          amount: Number(e.amount),
          description: e.description || undefined,
        })),
      equipmentUsed,
      // Goal 5: only complete rows submit — same "half-filled row is
      // dropped" rule every other sub-record array here follows.
      subcontractorEntries: subcontractorEntries
        .filter((s) => s.subcontractorId)
        .map((s) => ({
          clientGeneratedId: s.clientGeneratedId,
          subcontractorId: s.subcontractorId!,
          workNote: s.workNote || undefined,
          // goal 4: both stay additive/optional — an entry with neither
          // submits exactly as informational-only as it always has.
          // Review fix (finding #10): a siteContractId with an invalid
          // (blank/0/negative) quantity is dropped back to informational-
          // only client-side, rather than reaching the server as a
          // positive()-violating value that fails the whole submission.
          siteContractId: isSubcontractorLinkValid(s) ? s.siteContractId! : undefined,
          quantity: isSubcontractorLinkValid(s) ? Number(s.quantity) : undefined,
        })),
      // spec-dsr-labour-dropdown: only complete (a Labourer picked) rows
      // submit, same rule every other sub-record array here follows.
      labourEntries: labourEntries
        .filter((l) => l.labourerId)
        .map((l) => ({
          clientGeneratedId: l.clientGeneratedId,
          labourerId: l.labourerId!,
        })),
      // goal 3: same "only complete rows submit" rule as every sibling array.
      wasteDisposalEntries: wasteEntries.filter(isWasteRowComplete).map((w) => {
        const machineryId = w.equipmentValue.startsWith("machinery:") ? w.equipmentValue.slice(10) : undefined;
        const vehicleId = w.equipmentValue.startsWith("vehicle:") ? w.equipmentValue.slice(8) : undefined;
        const hasRate = w.ratePerTrip.trim() !== "";
        return {
          clientGeneratedId: w.clientGeneratedId,
          wasteType: w.wasteType,
          quantityDetails: w.quantityDetails || undefined,
          ownership: w.ownership,
          vendorId: w.ownership === "HIRED" ? (w.vendorId ?? undefined) : undefined,
          machineryId,
          vehicleId,
          vehicleDetails: w.vehicleDetails || undefined,
          tripCount: Number(w.tripCount),
          ratePerTrip: hasRate ? Number(w.ratePerTrip) : undefined,
          otherCharges: w.otherCharges ? Number(w.otherCharges) : undefined,
          disposalLocation: w.disposalLocation || undefined,
          paymentStatus:
            hasRate && w.paymentStatus ? (w.paymentStatus as "PAID" | "PARTIAL" | "UNPAID") : undefined,
          notes: w.notes || undefined,
        };
      }),
    });
  }

  // spec-dsr-drafts: Save Draft — persist progress with zero module side
  // effects. Online-only (the offline queue can't mint an auth token); a
  // failure surfaces inline rather than falling back to the device queue,
  // which only ever carries a full SUBMITTED submission.
  async function handleSaveDraft() {
    if (!siteId) return;
    setError(null);
    setDraftSaved(false);
    setIsSavingDraft(true);
    try {
      const res = await authedFetch(`/dsr/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        setError("Couldn't save this draft. Please try again.");
        return;
      }
      const draft = (await res.json()) as { id: string };
      setDraftId(draft.id);
      setDailySiteReportId(draft.id);
      setDraftSaved(true);
      // The entries now live in the server-side draft — the local safety-net
      // snapshot has served its purpose.
      clearDsrAutosave(siteId, reportDate);
      setRestoredAutosaveAt(null);
      // Upload any staged photos not yet on the server against the draft row.
      for (const photo of photos) {
        if (photo.status !== "uploaded" && photo.file) {
          void uploadStagedPhoto(draft.id, photo.localId, photo.file);
        }
      }
    } catch {
      setError("Couldn't save this draft — check your connection and try again.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  // spec-dsr-drafts: Finalize — persist the latest form state to the draft,
  // then flip it to SUBMITTED (materialising sub-records + applying stock once,
  // server-side, atomically). Insufficient stock rolls the whole finalize back
  // server-side and returns a clear error; the report stays a draft.
  async function handleFinalize() {
    if (!siteId) return;
    setError(null);
    setDraftSaved(false);
    setIsSubmitting(true);
    try {
      // Save first so Finalize always operates on the freshest state, even if
      // the user edited after their last explicit Save Draft.
      const saveRes = await authedFetch(`/dsr/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!saveRes.ok) {
        setError("Couldn't save this report before finalizing. Please try again.");
        return;
      }
      const saved = (await saveRes.json()) as { id: string };
      setDraftId(saved.id);
      setDailySiteReportId(saved.id);
      // Any staged photos must be on the draft row before it's finalized, or
      // they'd stay hidden. Await them, and abort the finalize if any fails —
      // never silently finalize a report missing a photo the Supervisor added
      // (review item 7). Wrapped in try/catch so a rejected upload surfaces as
      // an inline error instead of hanging the button.
      const pendingPhotos = photos.filter((p) => p.status !== "uploaded" && p.file);
      if (pendingPhotos.length > 0) {
        let uploadResults: boolean[];
        try {
          uploadResults = await Promise.all(
            pendingPhotos.map((p) => uploadStagedPhoto(saved.id, p.localId, p.file!)),
          );
        } catch {
          uploadResults = [false];
        }
        if (uploadResults.some((ok) => !ok)) {
          setError("A photo couldn't be uploaded. Retry the failed photos, then finalize again.");
          return;
        }
      }

      const res = await authedFetch(`/dsr/${saved.id}/finalize`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const code = (body as { error?: { code?: string; message?: string } } | null)?.error;
        setError(
          code?.code === "INSUFFICIENT_STOCK"
            ? (code.message ?? "Not enough Site Stock for a Material on this report.")
            : ((body as { message?: string } | null)?.message ??
                "Something went wrong finalizing this report. Please try again."),
        );
        return;
      }
      setDraftId(null);
      setIsResumedDraft(false);
      setSyncState("synced");
      clearDsrAutosave(siteId, reportDate);
      setRestoredAutosaveAt(null);
      // Every staged photo was already awaited above (unlike doSubmit's
      // fire-and-forget uploads) — no need to wait for an effect, navigate
      // straight away.
      router.push(`/daily-activity/history?flash=${encodeURIComponent("Daily Report submitted")}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // spec-dsr-drafts: Discard — hard-delete the draft and its hidden photos.
  // Review item 7: behind an explicit confirm (it's irreversible) and disabled
  // while its DELETE is in flight, so a double-tap can't fire two DELETEs.
  async function handleDiscard() {
    if (!draftId || isDiscarding) return;
    const confirmed = window.confirm(
      "Discard this draft? This permanently deletes it and any photos you added, and can't be undone.",
    );
    if (!confirmed) return;

    setIsDiscarding(true);
    setError(null);
    try {
      const res = await authedFetch(`/dsr/draft/${draftId}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Couldn't discard this draft. Please try again.");
        return;
      }
      // Reset the form to a clean slate for this (site,date).
      setDraftId(null);
      setIsResumedDraft(false);
      setDraftSaved(false);
      setDailySiteReportId(null);
      setWorkCompleted("");
      setIssuesBlockers("");
      setCrew([]);
      setConsumptions([]);
      setRmcEntries([]);
      setExpenses([]);
      setEquipmentUsed([]);
      setSubcontractorEntries([]);
      setLabourEntries([]);
      setWasteEntries([]);
      for (const photo of photos) {
        if (photo.file) URL.revokeObjectURL(photo.previewUrl);
      }
      setPhotos([]);
      // Discard already hard-deletes the draft row and its photos
      // server-side (dsr.service.ts) — this just clears the now-stale local
      // copy of what was showing.
      setExistingPhotos([]);
      // A discarded report's local snapshot must not resurrect it.
      clearDsrAutosave(siteId, reportDate);
      setRestoredAutosaveAt(null);
    } catch {
      setError("Couldn't discard this draft — check your connection and try again.");
    } finally {
      setIsDiscarding(false);
    }
  }

  // Runs only after the ConfirmDialog's explicit Confirm — the form's
  // onSubmit only opens that dialog.
  async function doSubmit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateDsrInput = buildPayload();

      // Submitting never fails from the Supervisor's point of view (Task 1)
      // — a network failure, timeout, or 5xx falls back to the local queue
      // instead of surfacing an error.
      let res: Response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        res = await authedFetch(`/dsr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        await queueDsr(payload);
        setSyncState("queued");
        clearDsrAutosave(siteId, reportDate);
        setRestoredAutosaveAt(null);
        return;
      }

      if (res.status === 409) {
        const body = await res.json();
        setError(body.message ?? "This report could not be saved — a conflicting entry already exists.");
        return;
      }
      if (res.status >= 500) {
        await queueDsr(payload);
        setSyncState("queued");
        clearDsrAutosave(siteId, reportDate);
        setRestoredAutosaveAt(null);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const code = (body as { error?: { code?: string; message?: string } } | null)?.error;
        setError(
          code?.code === "INSUFFICIENT_STOCK"
            ? (code.message ?? "Not enough Site Stock for a Material on this report.")
            : "Something went wrong submitting this report. Please try again.",
        );
        return;
      }

      const dsr = (await res.json()) as { id: string };
      setDailySiteReportId(dsr.id);
      setSyncState("synced");
      clearDsrAutosave(siteId, reportDate);
      setRestoredAutosaveAt(null);
      for (const photo of photos) {
        if (photo.status !== "uploaded" && photo.file) {
          void uploadStagedPhoto(dsr.id, photo.localId, photo.file);
        }
      }
      // Defers navigation to the effect above until every fire-and-forget
      // upload just kicked off has resolved (or been retried/removed).
      setAwaitingUploadsBeforeNav(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-160">
      <Link
        href="/daily-activity"
        className="mb-4 inline-block text-body-sm font-medium text-accent-teal-700 hover:underline"
      >
        ← Back to Daily Reports
      </Link>
      <h1 className="mb-1 text-page-title text-ink-900">Daily Report</h1>
      <p className="mb-6 text-body-sm text-ink-500">Log today&apos;s activity in under 5 minutes.</p>

      {/* Review item 11: continuing saved work, not a fresh form. */}
      {isResumedDraft ? (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-md bg-surface-2 p-3 text-body-sm text-ink-700">
          <RotateCcwIcon className="size-5 shrink-0 text-accent-teal-700" />
          Continuing your saved draft — nothing is posted until you finalize.
        </p>
      ) : null}

      {/* Autosave restore: the app closed mid-entry and this device kept the
          typed entries. Mutually exclusive with the draft banner above —
          prefillFromDraft clears restoredAutosaveAt when a server draft wins. */}
      {restoredAutosaveAt !== null && !isResumedDraft ? (
        <div role="status" className="mb-6 flex items-start gap-2 rounded-md bg-surface-2 p-3 text-body-sm text-ink-700">
          <RotateCcwIcon className="mt-0.5 size-5 shrink-0 text-accent-teal-700" />
          <span>
            Welcome back — we restored the entries you were working on
            {reportDate !== todayDate() ? ` for ${reportDate}` : ""}.
            {restoredHadPhotos ? " Photos can't be restored; please re-attach them." : ""}{" "}
            <button
              type="button"
              onClick={() => {
                clearDsrAutosave(siteId, reportDate);
                window.location.reload();
              }}
              className="font-medium text-accent-teal-700 underline"
            >
              Start fresh instead
            </button>
          </span>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          // isSavingDraft/isDiscarding: a confirm racing an in-flight draft
          // POST could land both a draft row and a one-shot report for the
          // same (site, date).
          if (!siteId || isSubmitting || isSavingDraft || isDiscarding) return;
          setConfirmAction("submit");
        }}
      >
        <Card className="mb-4">
          {/* Searchable + device-remembered Site picker (D5): a Supervisor
              working one Site all day opens the form already pointed at it;
              a ?siteId= deep link still wins over the remembered one. */}
          <SiteField
            sites={sites}
            required
            initialSiteId={searchParams.get("siteId") ?? undefined}
            onSiteChange={setSiteId}
          />
          <TextField
            label="Date"
            type="date"
            required
            icon={<CalendarIcon className="size-4" />}
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
          {/* Multiline — a day's work summary is narrative text, not a
              one-line value (the shared TextareaField, per AD-5). */}
          <TextareaField
            label="Work completed"
            rows={3}
            value={workCompleted}
            onChange={(e) => setWorkCompleted(e.target.value)}
          />
          <TextareaField
            label="Issues / blockers"
            rows={2}
            hint="Optional"
            value={issuesBlockers}
            onChange={(e) => setIssuesBlockers(e.target.value)}
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Crew present today</h2>
          {crew.length === 0 ? (
            <p className="mb-3 text-body-sm text-ink-500">No prior attendance found — add crew members below.</p>
          ) : null}
          <ul className="mb-3 flex flex-col gap-2">
            {crew.map((row) => (
              <li key={row.teamMemberId} className="flex items-center gap-3">
                {/* size-5 box + a label that stretches the row: the whole
                    name is a ~44px-tall tap target (gloves-and-glare rule),
                    not just the checkbox square. */}
                <input
                  type="checkbox"
                  id={`crew-${row.teamMemberId}`}
                  checked={row.attended}
                  onChange={() => toggleAttended(row.teamMemberId)}
                  className="size-5 shrink-0 accent-accent-teal-700"
                />
                <label htmlFor={`crew-${row.teamMemberId}`} className="flex-1 py-2.5 text-body-sm text-ink-900">
                  {row.name ?? "Crew member"}
                </label>
                {row.attended ? <Badge variant="success">Present</Badge> : <Badge variant="neutral">Absent</Badge>}
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCrewMember(row.teamMemberId)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <ComboboxField
            label="Add crew member"
            icon={<UserIcon className="size-4" />}
            options={reference.teamMemberOptions}
            value={newCrewId}
            onValueChange={addCrewMember}
            loading={reference.loading}
            placeholder="Type a name…"
            emptyMessage={reference.loadFailed ? "Couldn't load Team Members — check your connection" : "No matching Team Member"}
            onCreateNew={() => setTeamMemberQuickCreateOpen(true)}
            createNewLabel="+ Add Team Member"
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Materials Used</h2>
          {consumptions.map((row, index) => {
            const stock = siteId
              ? stockStatus({
                  stock: siteStock,
                  materialSizeId: row.materialSizeId,
                  quantity: row.quantity,
                  location: "this Site",
                  elsewhere: elsewhereGodown,
                  otherSite: row.materialSizeId ? (otherSiteStock.get(row.materialSizeId) ?? null) : null,
                })
              : undefined;
            // The unit is already on the picked option (its description) —
            // restate it on the quantity label so "50" is never ambiguous.
            const unit = materialOptions.find((option) => option.value === row.materialSizeId)?.description;
            return (
              <div
                key={row.clientGeneratedId}
                className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
              >
                <ComboboxField
                  label="Material"
                  className="sm:col-span-7"
                  options={materialOptions}
                  value={row.materialSizeId}
                  onValueChange={(value) =>
                    setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: value } : r)))
                  }
                  loading={reference.loading}
                  placeholder="Type a Material name…"
                  hint={stock?.text}
                  hintTone={stock?.tone}
                  emptyMessage={reference.loadFailed ? "Couldn't load Materials — check your connection" : "No matching Material"}
                  onCreateNew={() => setMaterialQuickCreateRow(index)}
                  createNewLabel="+ Add Material"
                />
                <div className="sm:col-span-3">
                  <TextField
                    label={unit ? `Quantity (${unit})` : "Quantity"}
                    type="number"
                    min={0}
                    step="any"
                    value={row.quantity}
                    onChange={(e) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)))}
                  />
                </div>
                <div className="sm:col-span-12 flex sm:justify-end">
                  <Button type="button" variant="ghost" onClick={() => setConsumptions((rows) => rows.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setConsumptions((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), materialSizeId: null, quantity: "", activityReference: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add material
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">RMC (ready-mix concrete) used</h2>
          {rmcEntries.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Vendor"
                className="sm:col-span-5"
                options={reference.vendorOptions}
                value={row.vendorId}
                onValueChange={(value) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Vendor name…"
                emptyMessage={reference.loadFailed ? "Couldn't load Vendors — check your connection" : "No matching Vendor"}
                onCreateNew={() => setVendorQuickCreateRow(index)}
                createNewLabel="+ Add Vendor"
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Quantity (m³)"
                  type="number"
                  min={0}
                  step="any"
                  value={row.quantityM3}
                  onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, quantityM3: e.target.value } : r)))}
                />
              </div>
              {reference.rmcGradeOptions.length > 0 ? (
                <ComboboxField
                  label="Grade"
                  className="sm:col-span-2"
                  options={reference.rmcGradeOptions.map((g) => ({ value: g, label: g }))}
                  value={row.grade || null}
                  onValueChange={(value) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, grade: value ?? "" } : r)))}
                  placeholder="e.g. M25"
                  emptyMessage="No matching grade — add it under Materials → RMC"
                />
              ) : (
                <div className="sm:col-span-2">
                  <TextField
                    label="Grade"
                    placeholder="e.g. M20, M25"
                    value={row.grade}
                    onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, grade: e.target.value } : r)))}
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <AmountField
                  label="Rate per m³"
                  value={row.ratePerM3}
                  onChange={(e) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, ratePerM3: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-12 flex sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setRmcEntries((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRmcEntries((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), vendorId: null, quantityM3: "", grade: "", ratePerM3: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add RMC delivery
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Expenses</h2>
          {expenses.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Category"
                className="sm:col-span-4"
                options={reference.expenseCategoryOptions}
                value={row.categoryId}
                onValueChange={(value) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, categoryId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Category…"
                emptyMessage={reference.loadFailed ? "Couldn't load Categories — check your connection" : "No matching Category"}
              />
              <div className="sm:col-span-3">
                <AmountField
                  label="Amount"
                  value={row.amount}
                  onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, amount: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-3">
                <TextField
                  label="Description"
                  hint="Optional"
                  value={row.description}
                  onChange={(e) => setExpenses((rows) => rows.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)))}
                />
              </div>
              <div className="sm:col-span-12 flex sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setExpenses((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setExpenses((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), categoryId: null, amount: "", description: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add expense
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Equipment used today</h2>
          {equipmentUsed.length > 0 ? (
            <ul className="mb-3 flex flex-col gap-2">
              {equipmentUsed.map((row) => (
                <li key={row.id} className="mb-2 flex flex-col gap-2 border-b border-border-hairline pb-2 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="size-4 text-ink-500" />
                    <span className="flex-1 text-body-sm text-ink-900">
                      {row.type === "OTHER" ? "Other Vehicle" : row.name}
                    </span>
                    <Badge variant="neutral">
                      {row.type === "MACHINERY" ? "Machinery" : row.type === "VEHICLE" ? "Vehicle" : "Other"}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEquipmentUsed((rows) => rows.filter((r) => r.id !== row.id))}
                    >
                      Remove
                    </Button>
                  </div>
                  {/* Goal 2: "Other Vehicle" has no register entry — the
                      description IS the record. Goal 5: every row also gets
                      an optional note. */}
                  <TextField
                    label={row.type === "OTHER" ? "Describe this vehicle" : "Notes"}
                    hint={row.type === "OTHER" ? undefined : "Optional"}
                    required={row.type === "OTHER"}
                    placeholder={row.type === "OTHER" ? "e.g. Hired dumper — MH12 AB 1234" : "e.g. Used for excavation"}
                    value={row.description ?? ""}
                    onChange={(e) => updateEquipmentDescription(row.id, e.target.value)}
                    error={equipmentDescriptionError(row)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          <ComboboxField
            label="Add machinery or vehicle"
            icon={<TruckIcon className="size-4" />}
            options={reference.equipmentOptions}
            value={newEquipmentId}
            onValueChange={addEquipment}
            loading={reference.loading}
            placeholder="Type a machine name or vehicle number…"
            emptyMessage={
              reference.loadFailed
                ? "Couldn't load the registers — check your connection"
                : "No matching Machinery or Vehicle in the registers"
            }
            onCreateNew={() => setVehicleQuickCreateOpen(true)}
            createNewLabel="+ Add Vehicle"
          />
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Waste Material</h2>
          {wasteEntries.map((row, index) => {
            const hasRate = row.ratePerTrip.trim() !== "";
            return (
              <div
                key={row.clientGeneratedId}
                className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
              >
                <div className="sm:col-span-4">
                  <TextField
                    label="Waste / material type"
                    placeholder="e.g. Debris, Excavated earth / murum"
                    value={row.wasteType}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, wasteType: e.target.value } : r)))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <SelectField
                    label="Own / Hired"
                    value={row.ownership}
                    onChange={(e) => {
                      const next = e.target.value === "OWN" ? "OWN" : "HIRED";
                      setWasteEntries((rows) =>
                        rows.map((r, i) =>
                          i === index
                            ? { ...r, ownership: next, ...(next === "OWN" ? { vendorId: null, paymentStatus: "" } : {}) }
                            : r,
                        ),
                      );
                    }}
                    options={[
                      { value: "HIRED", label: "Hired (third party)" },
                      { value: "OWN", label: "Own vehicle / machine" },
                    ]}
                  />
                </div>
                {row.ownership === "HIRED" ? (
                  <div className="sm:col-span-3">
                    <ComboboxField
                      label="Party / Vendor"
                      options={reference.vendorOptions}
                      value={row.vendorId}
                      onValueChange={(value) =>
                        setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: value } : r)))
                      }
                      loading={reference.loading}
                      placeholder="Type a Vendor name…"
                      emptyMessage={reference.loadFailed ? "Couldn't load Vendors — check your connection" : "No matching Vendor"}
                    />
                  </div>
                ) : null}
                <div className="sm:col-span-3">
                  <ComboboxField
                    label="Own machinery / vehicle"
                    options={machineryVehicleOptions}
                    value={row.equipmentValue || null}
                    onValueChange={(value) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, equipmentValue: value ?? "" } : r)))
                    }
                    placeholder="Type a machine name or vehicle number…"
                    hint="Own asset only"
                    emptyMessage={
                      reference.loadFailed ? "Couldn't load the registers — check your connection" : "No matching Machinery or Vehicle"
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <TextField
                    label="Vehicle details"
                    hint="Optional — e.g. hired dumper MH15CD5678"
                    value={row.vehicleDetails}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vehicleDetails: e.target.value } : r)))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="Number of trips"
                    type="number"
                    min={0}
                    step="1"
                    inputMode="numeric"
                    value={row.tripCount}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, tripCount: e.target.value } : r)))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <AmountField
                    label="Rate per trip"
                    hint="Optional — leave blank if unpriced"
                    value={row.ratePerTrip}
                    onChange={(e) => {
                      const next = e.target.value;
                      setWasteEntries((rows) =>
                        rows.map((r, i) =>
                          i === index
                            ? {
                                ...r,
                                ratePerTrip: next,
                                // Same finding as the standalone Waste
                                // Material form: blanking the rate must also
                                // reset Payment status, or re-entering a rate
                                // later silently resurfaces a stale choice.
                                paymentStatus: r.ratePerTrip.trim() !== "" && next.trim() === "" ? "" : r.paymentStatus,
                              }
                            : r,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <AmountField
                    label="Other charges"
                    hint="Optional — loading, JCB, toll"
                    value={row.otherCharges}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, otherCharges: e.target.value } : r)))
                    }
                  />
                </div>
                {row.ownership === "HIRED" ? (
                  <div className="sm:col-span-2">
                    <SelectField
                      label="Payment status"
                      disabled={!hasRate}
                      value={hasRate ? row.paymentStatus : ""}
                      onChange={(e) =>
                        setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, paymentStatus: e.target.value } : r)))
                      }
                      hint={hasRate ? undefined : "Enter a rate to set this"}
                      options={
                        hasRate
                          ? [
                              { value: "", label: "Select…" },
                              { value: "UNPAID", label: "Unpaid" },
                              { value: "PARTIAL", label: "Partial" },
                              { value: "PAID", label: "Paid" },
                            ]
                          : [{ value: "", label: "—" }]
                      }
                    />
                  </div>
                ) : null}
                <div className="sm:col-span-3">
                  <TextField
                    label="Quantity"
                    hint="Optional — e.g. approx 40 MT"
                    value={row.quantityDetails}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, quantityDetails: e.target.value } : r)))
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <TextField
                    label="Disposal location"
                    hint="Optional"
                    value={row.disposalLocation}
                    onChange={(e) =>
                      setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, disposalLocation: e.target.value } : r)))
                    }
                  />
                </div>
                <div className="sm:col-span-4">
                  <TextareaField
                    label="Notes"
                    rows={2}
                    hint="Optional"
                    value={row.notes}
                    onChange={(e) => setWasteEntries((rows) => rows.map((r, i) => (i === index ? { ...r, notes: e.target.value } : r)))}
                  />
                </div>
                <div className="sm:col-span-12 flex sm:justify-end">
                  <Button type="button" variant="ghost" onClick={() => setWasteEntries((rows) => rows.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setWasteEntries((rows) => [
                ...rows,
                {
                  clientGeneratedId: crypto.randomUUID(),
                  wasteType: "",
                  quantityDetails: "",
                  ownership: "HIRED",
                  vendorId: null,
                  equipmentValue: "",
                  vehicleDetails: "",
                  tripCount: "",
                  ratePerTrip: "",
                  otherCharges: "",
                  paymentStatus: "",
                  disposalLocation: "",
                  notes: "",
                },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add waste trip
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Subcontractors on site</h2>
          {subcontractorEntries.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Subcontractor"
                className="sm:col-span-5"
                options={reference.subcontractorOptions}
                value={row.subcontractorId}
                onValueChange={(value) =>
                  setSubcontractorEntries((rows) =>
                    // Same dedupe pattern as the crew/equipment pickers: a
                    // Subcontractor already picked in another row can't be
                    // picked again for this one.
                    value && rows.some((r, i) => i !== index && r.subcontractorId === value)
                      ? rows
                      : rows.map((r, i) =>
                          i === index
                            ? {
                                ...r,
                                subcontractorId: value,
                                // Review fix (finding #5): an ACTUAL change
                                // of Subcontractor invalidates a previously
                                // picked Site Contract that belonged to the
                                // OLD Subcontractor — never leave a
                                // mismatched pairing silently in place. A
                                // no-op re-selection of the same value must
                                // not wipe an already-typed quantity.
                                ...(value !== r.subcontractorId ? { siteContractId: null, quantity: "" } : {}),
                              }
                            : r,
                        ),
                  )
                }
                loading={reference.loading}
                placeholder="Type a Subcontractor name…"
                emptyMessage={reference.loadFailed ? "Couldn't load Subcontractors — check your connection" : "No matching Subcontractor"}
                onCreateNew={() => setSubcontractorQuickCreateRow(index)}
                createNewLabel="+ Add Subcontractor"
              />
              <div className="sm:col-span-5">
                <TextField
                  label="Work note"
                  hint="Optional"
                  placeholder="e.g. Shuttering — 2nd floor"
                  value={row.workNote}
                  onChange={(e) =>
                    setSubcontractorEntries((rows) => rows.map((r, i) => (i === index ? { ...r, workNote: e.target.value } : r)))
                  }
                />
              </div>
              {/* goal 4: both OPTIONAL — an entry with neither stays exactly
                  as informational-JSON-only as before. Only picking a
                  Contract AND typing a quantity creates a real ledger row. */}
              <div className="sm:col-span-5">
                <ComboboxField
                  label="Site Contract"
                  hint="Optional — links to a Site Contract for quantity tracking"
                  options={siteContractOptionsFor(row)}
                  value={row.siteContractId}
                  onValueChange={(value) =>
                    setSubcontractorEntries((rows) =>
                      rows.map((r, i) => (i === index ? { ...r, siteContractId: value, quantity: value ? r.quantity : "" } : r)),
                    )
                  }
                  placeholder="Type to link a Site Contract…"
                  emptyMessage="No matching Active Site Contract for this Site"
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Quantity completed"
                  type="number"
                  min={0}
                  step="any"
                  disabled={!row.siteContractId}
                  hint={row.siteContractId ? "Optional" : "Pick a Contract"}
                  value={row.quantity}
                  onChange={(e) =>
                    setSubcontractorEntries((rows) => rows.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)))
                  }
                />
              </div>
              <div className="sm:col-span-12 flex sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setSubcontractorEntries((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setSubcontractorEntries((rows) => [
                ...rows,
                { clientGeneratedId: crypto.randomUUID(), subcontractorId: null, workNote: "", siteContractId: null, quantity: "" },
              ])
            }
          >
            <PlusIcon className="size-4" />
            Add subcontractor
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Labour</h2>
          {labourEntries.map((row, index) => (
            <div
              key={row.clientGeneratedId}
              className="mb-3 grid grid-cols-1 gap-x-3 border-b border-border-hairline sm:grid-cols-12 sm:items-start"
            >
              <ComboboxField
                label="Labour"
                className="sm:col-span-10"
                options={reference.labourerOptions}
                value={row.labourerId}
                onValueChange={(value) =>
                  setLabourEntries((rows) =>
                    // Same dedupe pattern as the Subcontractor picker: a
                    // Labourer already picked in another row can't be picked
                    // again for this one — one row = one named person.
                    value && rows.some((r, i) => i !== index && r.labourerId === value)
                      ? rows
                      : rows.map((r, i) => (i === index ? { ...r, labourerId: value } : r)),
                  )
                }
                loading={reference.loading}
                placeholder="Type a Labour name…"
                emptyMessage={reference.loadFailed ? "Couldn't load Labour — check your connection" : "No matching Labour"}
                onCreateNew={() => setLabourerQuickCreateRow(index)}
                createNewLabel="+ Add Labour"
              />
              <div className="sm:col-span-2 flex sm:items-end sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setLabourEntries((rows) => rows.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLabourEntries((rows) => [...rows, { clientGeneratedId: crypto.randomUUID(), labourerId: null }])}
          >
            <PlusIcon className="size-4" />
            Add labour
          </Button>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-card-title text-ink-900">Site Photos</h2>
          {/* spec-dsr-photo-management: a resumed draft's already-uploaded
              photos — each with its own immediate Remove (real soft delete,
              not a local-only hide). */}
          {existingPhotos.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="flex w-16 flex-col items-center gap-1">
                  <div className="relative size-16 overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                    <PhotoThumbnail src={photo.url} alt="" className="size-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo.id)}
                    disabled={removingPhotoId === photo.id}
                    className="flex min-h-8 items-center gap-1 px-2 py-1.5 text-caption text-ink-500 underline disabled:opacity-50"
                  >
                    <TrashIcon className="size-3" />
                    {removingPhotoId === photo.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.localId} className="flex w-16 flex-col items-center gap-1">
                <div className="relative size-16 overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local
                      blob: preview of a just-captured File, not an optimizable
                      remote/static asset. */}
                  <img src={photo.previewUrl} alt="" className="size-full object-cover" />
                  {photo.status === "uploading" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-0/70 text-caption text-ink-500">
                      Uploading…
                    </div>
                  ) : null}
                  {photo.status === "uploaded" ? (
                    <CheckCircleIcon className="absolute right-0.5 bottom-0.5 size-4 rounded-full bg-surface-1 text-success-700" />
                  ) : null}
                </div>
                {/* px/py padding widens the tap area well past the caption
                    text itself — these are field-thumb targets, not desktop
                    links. */}
                {photo.status === "failed" ? (
                  <button
                    type="button"
                    onClick={() => retryPhoto(photo.localId)}
                    className="flex min-h-8 items-center gap-1 px-2 py-1.5 text-caption text-danger-700 underline"
                  >
                    <RotateCcwIcon className="size-3" />
                    Retry
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.localId)}
                    className="min-h-8 px-2 py-1.5 text-caption text-ink-500 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {/* No `capture` attribute on purpose: with it, mobile browsers
                jump straight into the camera; without it, the OS picker
                offers both "take photo" and "choose from gallery". */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoCapture(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              title="Add photo"
              aria-label="Add photo"
              onClick={() => photoInputRef.current?.click()}
              className="flex size-16 items-center justify-center rounded-md border border-dashed border-border-strong text-ink-500 hover:border-accent-teal-700 hover:text-accent-teal-700"
            >
              <CameraIcon className="size-5" />
            </button>
          </div>
        </Card>

        {syncState === "queued" ? (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-warning-100 p-3 text-body-sm text-warning-700">
            <WifiOffIcon className="size-5 shrink-0" />
            {photos.length > 0
              ? "Saved on device — will sync when back online. Photos are not saved offline yet: keep this page open until it syncs, or re-attach them from your gallery later."
              : "Saved on device — will sync when back online"}
          </p>
        ) : null}
        {syncState === "synced" ? (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-success-100 p-3 text-body-sm text-success-700">
            <CheckCircleIcon className="size-5 shrink-0" />
            Synced
          </p>
        ) : null}
        {/* spec-dsr-drafts: a draft is explicitly inert — spell out that nothing
            reaches Inventory/Expenses/reports until Finalize. */}
        {draftSaved ? (
          <p role="status" className="mb-4 flex items-center gap-2 rounded-md bg-surface-2 p-3 text-body-sm text-ink-700">
            <CheckCircleIcon className="size-5 shrink-0 text-success-700" />
            Draft saved — nothing posts to Inventory, Expenses, or reports until you finalize
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {error}
          </p>
        ) : null}

        {/* spec-dsr-drafts: once a draft exists, the primary action is
            Finalize (it flips DRAFT -> SUBMITTED, applying stock once); a
            one-shot Submit alongside a live draft would create a duplicate
            SUBMITTED row, so it's replaced. With no draft yet, the existing
            offline-capable one-shot Submit is unchanged. */}
        {draftId ? (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => setConfirmAction("finalize")}
              isLoading={isSubmitting}
              disabled={!siteId || isDiscarding}
              className="w-full justify-center"
            >
              <CheckCircleIcon className="size-4" />
              Finalize Report
            </Button>
            {/* `sm:flex-1`, never bare `flex-1`: action-button-row is
                flex-col below sm, where flex-1's basis:0% is the VERTICAL
                axis — it collapses the buttons' h-10 to ~zero height
                (the "Save Draft shrinks after saving" bug). */}
            <div className="action-button-row">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                isLoading={isSavingDraft}
                disabled={!siteId || isDiscarding}
                className="w-full justify-center sm:w-auto sm:flex-1"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscard}
                isLoading={isDiscarding}
                disabled={isDiscarding}
                className="w-full justify-center sm:w-auto sm:flex-1"
              >
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button type="submit" isLoading={isSubmitting} disabled={!siteId} className="w-full justify-center">
              <CheckCircleIcon className="size-4" />
              Submit Daily Report
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={isSavingDraft}
              disabled={!siteId}
              className="w-full justify-center"
            >
              Save Draft
            </Button>
          </div>
        )}
      </form>

      {/* One playback dialog for both ways a report leaves this form — the
          Supervisor re-verifies the entered details before anything posts
          to Inventory/Expenses/reports (same ConfirmDialog every money/
          correction form already uses, AD-5). */}
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={confirmAction === "finalize" ? "Finalize this Daily Report?" : "Submit this Daily Report?"}
        description="Check the details below — Inventory, Expenses, and reports update once it goes in."
        confirmLabel={confirmAction === "finalize" ? "Confirm & Finalize" : "Confirm & Submit"}
        onConfirm={() => {
          const action = confirmAction;
          setConfirmAction(null);
          if (action === "finalize") void handleFinalize();
          else if (action === "submit") void doSubmit();
        }}
      >
        <ConfirmDialogRow label="Site" value={sites.find((s) => s.id === siteId)?.name ?? "—"} />
        <ConfirmDialogRow label="Date" value={reportDate} />
        <ConfirmDialogRow
          label="Crew present"
          value={`${crew.filter((c) => c.attended).length} of ${crew.length}`}
        />
        <ConfirmDialogRow
          label="Materials Used"
          value={String(consumptions.filter((c) => c.materialSizeId && c.quantity).length)}
        />
        <ConfirmDialogRow
          label="RMC entries"
          // Same predicate buildPayload uses — the count the user confirms
          // must be the count that submits. Rate is optional (goal 1), so
          // it's no longer part of this predicate.
          value={String(rmcEntries.filter((r) => r.vendorId && r.quantityM3 && r.grade).length)}
        />
        <ConfirmDialogRow
          label="Expenses"
          value={`${expenses.filter((e) => e.categoryId && e.amount).length} · ₹${expenses
            .filter((e) => e.categoryId && e.amount)
            .reduce((sum, e) => {
              const amount = Number(e.amount);
              return Number.isFinite(amount) ? sum + amount : sum;
            }, 0)
            .toLocaleString("en-IN")}`}
        />
        <ConfirmDialogRow label="Equipment used" value={String(equipmentUsed.length)} />
        <ConfirmDialogRow
          label="Waste Material"
          // Same predicate buildPayload uses — the count the user confirms
          // must be the count that submits.
          value={String(wasteEntries.filter(isWasteRowComplete).length)}
        />
        <ConfirmDialogRow
          label="Subcontractors"
          value={String(subcontractorEntries.filter((s) => s.subcontractorId).length)}
        />
        <ConfirmDialogRow label="Labour" value={String(labourEntries.filter((l) => l.labourerId).length)} />
        <ConfirmDialogRow label="Photos" value={String(existingPhotos.length + photos.length)} />
      </ConfirmDialog>

      <TeamMemberQuickCreateModal
        open={teamMemberQuickCreateOpen}
        onOpenChange={setTeamMemberQuickCreateOpen}
        onSuccess={(teamMember) => {
          reference.addTeamMemberOption({ value: teamMember.id, label: teamMember.name });
          addCrewMember(teamMember.id);
          setTeamMemberQuickCreateOpen(false);
        }}
      />
      <MaterialQuickCreateModal
        open={materialQuickCreateRow !== null}
        onOpenChange={(open) => {
          if (!open) setMaterialQuickCreateRow(null);
        }}
        onSuccess={(material) => {
          reference.addMaterialOption({ value: material.id, label: material.name });
          const index = materialQuickCreateRow;
          if (index !== null) {
            setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: material.id } : r)));
          }
          setMaterialQuickCreateRow(null);
        }}
      />
      <VendorQuickCreateModal
        open={vendorQuickCreateRow !== null}
        onOpenChange={(open) => {
          if (!open) setVendorQuickCreateRow(null);
        }}
        onSuccess={(vendor) => {
          reference.addVendorOption({ value: vendor.id, label: vendor.name });
          const index = vendorQuickCreateRow;
          if (index !== null) {
            setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: vendor.id } : r)));
          }
          setVendorQuickCreateRow(null);
        }}
      />
      <VehicleQuickCreateModal
        open={vehicleQuickCreateOpen}
        vehicleTypeOptions={reference.vehicleTypeOptions}
        onOpenChange={setVehicleQuickCreateOpen}
        onSuccess={(vehicle) => {
          reference.addVehicleOption({ id: vehicle.id, name: vehicle.name });
          setEquipmentUsed((rows) =>
            rows.some((r) => r.id === vehicle.id)
              ? rows
              : [...rows, { type: "VEHICLE", id: vehicle.id, name: vehicle.name }],
          );
          setVehicleQuickCreateOpen(false);
        }}
      />
      <SubcontractorQuickCreateModal
        open={subcontractorQuickCreateRow !== null}
        onOpenChange={(open) => {
          if (!open) setSubcontractorQuickCreateRow(null);
        }}
        onSuccess={(subcontractor) => {
          reference.addSubcontractorOption({ value: subcontractor.id, label: subcontractor.name });
          const index = subcontractorQuickCreateRow;
          if (index !== null) {
            setSubcontractorEntries((rows) =>
              rows.map((r, i) => (i === index ? { ...r, subcontractorId: subcontractor.id } : r)),
            );
          }
          setSubcontractorQuickCreateRow(null);
        }}
      />
      <DailyLabourerQuickCreateModal
        open={labourerQuickCreateRow !== null}
        onOpenChange={(open) => {
          if (!open) setLabourerQuickCreateRow(null);
        }}
        onSuccess={(labourer) => {
          reference.addLabourerOption({ value: labourer.id, label: labourer.name });
          const index = labourerQuickCreateRow;
          if (index !== null) {
            setLabourEntries((rows) => rows.map((r, i) => (i === index ? { ...r, labourerId: labourer.id } : r)));
          }
          setLabourerQuickCreateRow(null);
        }}
      />
    </div>
  );
}

// useSearchParams() requires a Suspense boundary during prerendering —
// the fallback is never visible in practice (the params are synchronously
// available on the client).
export default function NewDsrPage() {
  return (
    <Suspense fallback={null}>
      <NewDsrForm />
    </Suspense>
  );
}
