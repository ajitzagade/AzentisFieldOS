"use client";

import { type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AmountField,
  Badge,
  Button,
  CalendarIcon,
  Card,
  CameraIcon,
  CheckCircleIcon,
  ComboboxField,
  ConfirmDialog,
  ConfirmDialogRow,
  MapPinIcon,
  PencilIcon,
  PhotoThumbnail,
  PlusIcon,
  RotateCcwIcon,
  SelectField,
  TextField,
  TrashIcon,
  TruckIcon,
  UserIcon,
  useSubmitConfirmation,
} from "@azentisfieldos/ui";
import { dsrEquipmentUsedSchema, type CreateDsrInput } from "@azentisfieldos/shared";
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
import { SiteContractQuickCreateModal } from "../../sites/[id]/contracts/site-contract-quick-create-modal";

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
  status: string;
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

// Same predicate the submit payload's own filter uses — shared so the
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

// spec-dsr-labour-dropdown, revised 2026-09-24 (user-requested): one row
// combines the named-Labourer picker AND a Men/Women/Mistri headcount tally
// — all four fields optional, a row is complete once at least one is set
// (name someone, log a count, or both). Mirrors dsrLabourEntryNewSchema in
// daily-site-report.ts exactly.
interface LabourRow {
  clientGeneratedId: string;
  labourerId: string | null;
  men: string;
  women: string;
  mistri: string;
}

function isLabourRowComplete(row: LabourRow): boolean {
  return !!row.labourerId || (Number(row.men) || 0) > 0 || (Number(row.women) || 0) > 0 || (Number(row.mistri) || 0) > 0;
}

interface PhotoItem {
  localId: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
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

export interface DsrFormInitialValues {
  siteId: string;
  reportDate: string;
  workCompleted: string;
  issuesBlockers: string;
  workRecords: CrewRow[];
  consumptions: Omit<ConsumptionRow, "clientGeneratedId">[];
  rmcEntries: Omit<RmcRow, "clientGeneratedId">[];
  expenses: Omit<ExpenseRow, "clientGeneratedId">[];
  equipmentUsed: EquipmentRow[];
  // spec-dsr-activity-sync-detail-panel: unlike every other sub-record array
  // here, a Subcontractor/Waste Material row's clientGeneratedId is OPTIONAL
  // (not Omit'd) — see withPreservedRowIds below for why.
  subcontractorEntries?: (Omit<SubcontractorRow, "clientGeneratedId"> & { clientGeneratedId?: string })[];
  // spec-dsr-labour-dropdown, revised 2026-09-24: {labourerId?, men?,
  // women?, mistri?} rows — see LabourRow above.
  labourEntries?: Omit<LabourRow, "clientGeneratedId">[];
  wasteDisposalEntries?: (Omit<WasteRow, "clientGeneratedId"> & { clientGeneratedId?: string })[];
  // spec-dsr-photo-management: the report's already-uploaded photos (absent
  // in "new" mode — there's nothing to load yet). Rendered alongside the
  // new-upload dropzone with their own immediate Remove, independent of
  // `photos`/PhotoItem below (which only ever tracks THIS session's staged
  // uploads).
  photos?: { id: string; url: string }[];
}

// Rows carry a client-generated id from the moment they exist in the form
// (AD-8) so a re-submit upserts the same sub-records instead of
// duplicating them. Pre-filled correction rows get fresh ids — a
// correction always inserts brand-new rows server-side (AD-9).
function withRowIds<T>(rows: T[] | undefined): (T & { clientGeneratedId: string })[] {
  return (rows ?? []).map((row) => ({ ...row, clientGeneratedId: crypto.randomUUID() }));
}

// spec-dsr-activity-sync-detail-panel (goals 3-4): unlike every other DSR
// sub-record array (see withRowIds above — a fresh id there is correct,
// since correct()'s Consumption/RMC/Expense loops never read
// clientGeneratedId at all), a Waste Material/Subcontractor row's
// clientGeneratedId MUST survive a correction's pre-fill unchanged.
// dsr.service.ts's correct() resolves the ORIGINAL WasteDisposal/
// SubcontractorWorkEntry row via this exact id (matched against the
// superseded report's own rows) to set correctsId and compute the
// restated delta — a fresh id here would silently break that chain,
// making every corrected Waste Material trip / Work Entry double-count
// (WasteDisposalService.summary() / SiteContract.quantityCompleted).
// Falls back to a fresh id only for a genuinely new row (none supplied).
function withPreservedRowIds<T extends { clientGeneratedId?: string }>(
  rows: T[] | undefined,
): (T & { clientGeneratedId: string })[] {
  return (rows ?? []).map((row) => ({ ...row, clientGeneratedId: row.clientGeneratedId ?? crypto.randomUUID() }));
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// AC #1/#2/#3: the desktop counterpart to Story 3.1's mobile DSR form —
// same fields, same underlying endpoints (POST /dsr, POST /dsr/:id/correct
// from Story 3.5), same photo upload flow (Story 3.3) — only the platform-
// appropriate input methods differ (drag-drop dropzone here vs. mobile's
// camera tap; no offline queue here, since a desktop Owner/Admin session is
// not the field-connectivity scenario Story 3.2 was built for).
export function DsrDesktopForm({
  mode,
  originalId,
  initial,
}: {
  mode: "new" | "correct";
  originalId?: string;
  initial?: DsrFormInitialValues;
}) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  // Distinguish "still fetching" from "fetch failed" so the Site picker can
  // say which one is happening instead of silently offering an empty list
  // (AD-6).
  const [sitesState, setSitesState] = useState<{ status: "loading" | "loaded" | "failed"; sites: SiteOption[] }>({
    status: "loading",
    sites: [],
  });
  const sites = sitesState.sites;
  const reference = useDsrReferenceData();
  const [siteId, setSiteId] = useState(initial?.siteId ?? "");
  // FR-14: current availability at the selected Site, inside the Material
  // picker options and under each selected Material.
  const siteStock = useSiteStock(siteId);
  // A Material with real Godown balance that was simply never moved/
  // purchased to this Site would otherwise show a bare "No stock" —
  // indistinguishable from not existing at all (real end-to-end report,
  // 2026-09-22).
  const godownStock = useGodownStock();
  const elsewhereGodown = { label: "Godown", stock: godownStock };
  const materialOptions = useMemo(
    () => (siteId ? withStockMeta(reference.materialOptions, siteStock, elsewhereGodown) : reference.materialOptions),
    [reference.materialOptions, siteId, siteStock, godownStock],
  );
  const [reportDate, setReportDate] = useState(initial?.reportDate ?? todayDate());
  const [workCompleted, setWorkCompleted] = useState(initial?.workCompleted ?? "");
  const [issuesBlockers, setIssuesBlockers] = useState(initial?.issuesBlockers ?? "");
  const [reason, setReason] = useState("");

  const [crew, setCrew] = useState<CrewRow[]>(initial?.workRecords ?? []);
  const [newCrewId, setNewCrewId] = useState<string | null>(null);
  const [teamMemberQuickCreateOpen, setTeamMemberQuickCreateOpen] = useState(false);
  // Consumption/RMC rows each have their own Material/Vendor picker — the
  // quick-create modal is shared, so it tracks which row's picker opened it.
  const [materialQuickCreateRow, setMaterialQuickCreateRow] = useState<number | null>(null);
  const [vendorQuickCreateRow, setVendorQuickCreateRow] = useState<number | null>(null);
  const [vehicleQuickCreateOpen, setVehicleQuickCreateOpen] = useState(false);

  const [consumptions, setConsumptions] = useState<ConsumptionRow[]>(() => withRowIds(initial?.consumptions));
  // Informational-only "where else is this Material" — see
  // useOtherSiteStockMap's own comment. Called once here (not inside the
  // per-row render loop below) with every row's materialSizeId, looked up
  // per row with a plain Map.get() during render.
  const otherSiteStock = useOtherSiteStockMap(
    consumptions.map((c) => c.materialSizeId),
    siteId,
  );
  const [rmcEntries, setRmcEntries] = useState<RmcRow[]>(() => withRowIds(initial?.rmcEntries));
  const [expenses, setExpenses] = useState<ExpenseRow[]>(() => withRowIds(initial?.expenses));
  const [equipmentUsed, setEquipmentUsed] = useState<EquipmentRow[]>(initial?.equipmentUsed ?? []);
  const [newEquipmentId, setNewEquipmentId] = useState<string | null>(null);
  const [subcontractorEntries, setSubcontractorEntries] = useState<SubcontractorRow[]>(() =>
    withPreservedRowIds(initial?.subcontractorEntries),
  );
  const [subcontractorQuickCreateRow, setSubcontractorQuickCreateRow] = useState<number | null>(null);
  const [siteContractQuickCreateRow, setSiteContractQuickCreateRow] = useState<number | null>(null);
  const [labourEntries, setLabourEntries] = useState<LabourRow[]>(() => withRowIds(initial?.labourEntries));
  const [labourerQuickCreateRow, setLabourerQuickCreateRow] = useState<number | null>(null);
  const [wasteEntries, setWasteEntries] = useState<WasteRow[]>(() => withPreservedRowIds(initial?.wasteDisposalEntries));

  // goal 4: this Site's Active, non-FIXED_COST Site Contracts, for the
  // optional picker on each Subcontractor row. Keyed on siteId and shared
  // across every row, the same "one fetch per Site" pattern useSiteStock
  // uses (state keyed by siteId, compared against the current siteId when
  // read — never an eager synchronous reset inside the effect) — not part
  // of useDsrReferenceData since that hook loads once, globally, with no
  // Site scoping.
  // Fetches EVERY status now (was `&status=ACTIVE` only) — the picker
  // itself still only offers Active/non-Fixed-Cost contracts (Work Entries
  // can only be recorded against one, see work-entry-write.ts), but a
  // Draft/Completed/Cancelled contract needs to be visible too so
  // existingNonActiveContractFor below can tell the user one already
  // exists, instead of the field reading as if nothing was ever synced.
  const [siteContractState, setSiteContractState] = useState<{ siteId: string; contracts: SiteContractOption[] } | null>(
    null,
  );
  // Bumped after a successful "+ Create Site Contract" quick-create so the
  // fetch below re-runs — simpler and more correct than trying to splice a
  // partial local object (QuickCreateResult only carries {id, name}, not
  // the full status/rateType/workCategory this list needs).
  const [siteContractRefreshKey, setSiteContractRefreshKey] = useState(0);
  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    authedFetch(`/site-contracts?siteId=${siteId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((data: SiteContractOption[]) => {
        if (cancelled) return;
        setSiteContractState({ siteId, contracts: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setSiteContractState({ siteId, contracts: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, authedFetch, siteContractRefreshKey]);
  function contractsForSite() {
    return siteContractState?.siteId === siteId ? siteContractState.contracts : [];
  }
  // Revised 2026-09-24 (user-requested): lists EVERY contract for this
  // Site (any status), not just Active/non-Fixed-Cost — a Subcontractor
  // already synced from a previous DSR (dsr.service.ts's
  // syncMissingSiteContracts) starts DRAFT, and hiding it here made the
  // field look like nothing was ever synced. Non-Active contracts are still
  // pickable (for the Work note pairing / to see the link exists) but
  // won't accept a Quantity — see isPickedContractActive below, which gates
  // that field and the submit-time materialization. Scoped per-row to the
  // row's OWN picked Subcontractor (Review fix (finding #5)) — a row with
  // no Subcontractor picked yet sees every contract for the Site.
  function siteContractOptionsFor(row: SubcontractorRow) {
    return contractsForSite()
      .filter((c) => !row.subcontractorId || c.subcontractorId === row.subcontractorId)
      .map((c) => ({
        value: c.id,
        label:
          c.status === "ACTIVE"
            ? `${c.subcontractor.name} — ${c.workCategory ?? "General"}`
            : `${c.subcontractor.name} — ${c.workCategory ?? "General"} (${c.status === "DRAFT" ? "Draft" : c.status.charAt(0) + c.status.slice(1).toLowerCase()})`,
      }));
  }
  // Work Entries can only be recorded against an Active, non-Fixed-Cost
  // contract (work-entry-write.ts) — gates the Quantity Completed field and
  // the submit-time materialization below, now that the picker above lists
  // every status instead of narrowing to just the linkable ones.
  function isPickedContractActive(row: SubcontractorRow): boolean {
    if (!row.siteContractId) return false;
    const contract = contractsForSite().find((c) => c.id === row.siteContractId);
    return !!contract && contract.status === "ACTIVE" && contract.rateType !== "FIXED_COST";
  }
  // Waste Material's "Own machinery / vehicle" picker (goal 3) reuses the
  // same Machinery+Vehicle registers equipmentUsed already loads, minus the
  // synthetic "Other Vehicle" entry — WasteDisposal has its own free-text
  // vehicleDetails field for that case, never resolved against a register.
  const machineryVehicleOptions = useMemo(
    () => reference.equipmentOptions.filter((o) => o.equipmentType !== "OTHER"),
    [reference.equipmentOptions],
  );

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // spec-dsr-photo-management: the report's already-uploaded photos (edit
  // mode only — "new" mode's `initial` is undefined/photo-less). Removing
  // one is its own immediate request (soft delete), not deferred to this
  // form's submit — mirrors the quick-create-modal's immediate-write
  // pattern (see storage.service.ts's softDeletePhoto).
  const [existingPhotos, setExistingPhotos] = useState(initial?.photos ?? []);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once POST /dsr (or /correct) succeeds. From that moment the report
  // row exists server-side: submission must never re-fire (duplicate row),
  // and navigation waits until every staged photo has either uploaded or
  // been removed — redirecting with failed photos silently loses them.
  const [submittedDsrId, setSubmittedDsrId] = useState<string | null>(null);
  // A DSR correction supersedes the whole report and adjusts Site Stock —
  // held for re-verification before it goes to the ledger (FR-54).
  const confirmation = useSubmitConfirmation();

  useEffect(() => {
    authedFetch(`/sites`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((data: SiteOption[]) =>
        setSitesState({ status: "loaded", sites: Array.isArray(data) ? data : [] }),
      )
      .catch(() => setSitesState({ status: "failed", sites: [] }));
  }, [authedFetch]);

  // AC #1: crew checklist pre-populated from the Site's most recent prior
  // attendance — same behavior as the mobile flow. Not applicable in
  // "correct" mode, which pre-fills from the report being corrected instead.
  useEffect(() => {
    if (mode !== "new" || !siteId || !reportDate) return;
    authedFetch(`/dsr/defaults?siteId=${siteId}&date=${reportDate}`)
      .then((res) => res.json())
      .then((defaults: { teamMemberId: string; name: string }[]) => {
        setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true })));
      })
      .catch(() => setCrew([]));
  }, [mode, siteId, reportDate, authedFetch]);

  function toggleAttended(teamMemberId: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, attended: !r.attended } : r)));
  }

  // Goal 6: matches the mobile form's Remove — a crew member added by
  // mistake can be dropped before submitting.
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
    setNewCrewId(null);
  }

  function addEquipment(optionValue: string | null) {
    setNewEquipmentId(optionValue);
    if (!optionValue) return;
    const option = reference.equipmentOptions.find((o) => o.value === optionValue);
    if (!option) return;
    if (option.equipmentType === "OTHER") {
      // Goal 2: no register id to resolve — a fresh free-text row.
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

  function addPhotoFiles(fileList: FileList | null) {
    // Post-submission the report row exists and the only remaining work is
    // draining the staged uploads — a photo added NOW would sit forever in
    // "pending" (nothing uploads it) and block the redirect indefinitely.
    if (submittedDsrId) return;
    if (!fileList || fileList.length === 0) return;
    const newPhotos: PhotoItem[] = Array.from(fileList).map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
    }));
    setPhotos((rows) => [...rows, ...newPhotos]);
  }

  function removePhoto(localId: string) {
    setPhotos((rows) => rows.filter((p) => p.localId !== localId));
  }

  // spec-dsr-photo-management: unlike removePhoto above (a not-yet-submitted
  // local File, safe to just drop), an existing photo is already a real
  // Photo row — removal is its own immediate soft-delete request (mirrors
  // the quick-create-modal's immediate-write pattern), not deferred to this
  // form's own submit.
  async function removeExistingPhoto(photoId: string) {
    if (removingPhotoId || !originalId) return;
    setRemovingPhotoId(photoId);
    try {
      const res = await authedFetch(
        `/photos/${photoId}?dailySiteReportId=${encodeURIComponent(originalId)}`,
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

  async function uploadAllPhotos(dailySiteReportId: string, items: PhotoItem[]): Promise<number> {
    let failed = 0;
    for (const photo of items) {
      setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "uploading" } : p)));
      try {
        await uploadPhoto(authedFetch, dailySiteReportId, photo.file);
        setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "uploaded" } : p)));
      } catch {
        failed += 1;
        setPhotos((rows) => rows.map((p) => (p.localId === photo.localId ? { ...p, status: "failed" } : p)));
      }
    }
    return failed;
  }

  async function retryPhoto(localId: string) {
    const photo = photos.find((p) => p.localId === localId);
    if (!photo || !submittedDsrId) return;
    const failedAgain = await uploadAllPhotos(submittedDsrId, [photo]);
    if (failedAgain > 0) {
      setError("That photo failed to upload again — check your connection and retry.");
    }
  }

  // The failed-photos banner clears only once NO photo remains failed
  // (retried successfully or removed) — clearing it on a single successful
  // retry while others are still failed would strand the user with no
  // explanation for why the page hasn't moved on. Derived synchronously
  // from photo state on purpose: the alternative (clearing at each of the
  // retry/remove call sites) reads stale `photos` from their closures.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (submittedDsrId && !photos.some((p) => p.status === "failed")) {
      setError(null);
    }
  }, [submittedDsrId, photos]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The single navigation point after a successful submission: leaves only
  // once no photo is stuck in "failed"/"uploading" limbo (an empty list
  // passes trivially). Retrying or removing the last failed photo resumes
  // the redirect automatically.
  useEffect(() => {
    if (submittedDsrId && photos.every((p) => p.status === "uploaded")) {
      router.push(
        `/daily-activity/${submittedDsrId}?flash=${encodeURIComponent(
          mode === "correct" ? "Daily Report edited" : "Daily Report submitted",
        )}`,
      );
    }
  }, [submittedDsrId, photos, mode, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The report row already exists (photo recovery in progress) — a second
    // POST would duplicate it. The submit button is disabled too; this also
    // covers Enter-key form dispatch.
    if (submittedDsrId) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateDsrInput = {
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
        // row, it just submits without one and the server stores
        // totalAmount as null.
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
        // Goal 5: only complete rows submit, same rule every other
        // sub-record array here follows.
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
            // Revised 2026-09-24: the picker now also lists non-Active
            // contracts (see siteContractOptionsFor), so the same drop-back
            // now also applies when the picked contract isn't Active — the
            // server would otherwise reject the whole submission with
            // CONTRACT_NOT_ACTIVE (work-entry-write.ts).
            siteContractId: isSubcontractorLinkValid(s) && isPickedContractActive(s) ? s.siteContractId! : undefined,
            quantity: isSubcontractorLinkValid(s) && isPickedContractActive(s) ? Number(s.quantity) : undefined,
          })),
        // spec-dsr-labour-dropdown, revised 2026-09-24: only complete rows
        // submit (a Labourer picked, and/or a headcount entered), same rule
        // every other sub-record array here follows. 0/empty counts are sent
        // as undefined, not 0, to keep the payload minimal.
        labourEntries: labourEntries.filter(isLabourRowComplete).map((l) => ({
          clientGeneratedId: l.clientGeneratedId,
          labourerId: l.labourerId ?? undefined,
          men: Number(l.men) > 0 ? Number(l.men) : undefined,
          women: Number(l.women) > 0 ? Number(l.women) : undefined,
          mistri: Number(l.mistri) > 0 ? Number(l.mistri) : undefined,
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
      };

      const path = mode === "correct" ? `/dsr/${originalId}/correct` : `/dsr`;
      const body = mode === "correct" ? { ...payload, reason } : payload;

      const res = await authedFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const responseBody = await res.json();
        setError(responseBody.message ?? "This report could not be saved — a conflicting entry already exists.");
        return;
      }
      if (!res.ok) {
        const responseBody = (await res.json().catch(() => null)) as {
          error?: { code?: string; message?: string };
        } | null;
        setError(
          responseBody?.error?.code === "INSUFFICIENT_STOCK"
            ? (responseBody.error.message ?? "Not enough Site Stock for a Material on this report.")
            : "Something went wrong submitting this report. Please try again.",
        );
        return;
      }

      const dsr = (await res.json()) as { id: string };
      setSubmittedDsrId(dsr.id);
      if (photos.length > 0) {
        const failed = await uploadAllPhotos(dsr.id, photos);
        if (failed > 0) {
          setError(
            `Your report was submitted, but ${failed === 1 ? "1 photo" : `${failed} photos`} failed to upload. Retry or remove ${failed === 1 ? "it" : "them"} below — you'll continue automatically once every photo is uploaded.`,
          );
          return;
        }
      }
      // Navigation itself happens in the all-photos-uploaded effect above.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={mode === "correct" ? confirmation.guard(handleSubmit) : handleSubmit}
      className="mx-auto max-w-3xl"
    >
      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Editing this report
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked version — the original report is never overwritten or deleted (AD-9).
          </p>
          <TextField
            label="Reason for this edit"
            required
            icon={<PencilIcon className="size-4" />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Site"
          required
          icon={<MapPinIcon className="size-4" />}
          disabled={mode === "correct" || sitesState.status === "loading"}
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          options={[
            { value: "", label: sitesState.status === "loading" ? "Loading Sites…" : "Select a Site" },
            ...sites.map((s) => ({ value: s.id, label: s.name })),
          ]}
          error={sitesState.status === "failed" ? "Couldn't load Sites — reload the page to try again" : undefined}
        />
        <TextField
          label="Date"
          type="date"
          required
          icon={<CalendarIcon className="size-4" />}
          disabled={mode === "correct"}
          hint={mode === "correct" ? "An edit keeps the same Site and date as the report it edits." : undefined}
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
        />
        <TextField label="Work completed" icon={<PencilIcon className="size-4" />} value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} />
        <TextField label="Issues / blockers" icon={<PencilIcon className="size-4" />} hint="Optional" value={issuesBlockers} onChange={(e) => setIssuesBlockers(e.target.value)} />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Crew present</h2>
        {crew.length === 0 ? <p className="mb-3 text-body-sm text-ink-500">No crew added yet.</p> : null}
        <ul className="mb-3 flex flex-col gap-2">
          {crew.map((row) => (
            <li key={row.teamMemberId} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`crew-${row.teamMemberId}`}
                checked={row.attended}
                onChange={() => toggleAttended(row.teamMemberId)}
                className="size-4 accent-accent-teal-700"
              />
              <label htmlFor={`crew-${row.teamMemberId}`} className="text-body-sm text-ink-900">
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
          emptyMessage={reference.loadFailed ? "Couldn't load Team Members — try reloading" : "No matching Team Member"}
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
                onValueChange={(value) => setConsumptions((rows) => rows.map((r, i) => (i === index ? { ...r, materialSizeId: value } : r)))}
                loading={reference.loading}
                placeholder="Type a Material name…"
                hint={stock?.text}
                hintTone={stock?.tone}
                emptyMessage={reference.loadFailed ? "Couldn't load Materials — try reloading" : "No matching Material"}
                onCreateNew={() => setMaterialQuickCreateRow(index)}
                createNewLabel="+ Add Material"
              />
              <div className="sm:col-span-3">
                <TextField
                  label="Quantity"
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
              className="sm:col-span-4"
              options={reference.vendorOptions}
              value={row.vendorId}
              onValueChange={(value) => setRmcEntries((rows) => rows.map((r, i) => (i === index ? { ...r, vendorId: value } : r)))}
              loading={reference.loading}
              placeholder="Type a Vendor name…"
              emptyMessage={reference.loadFailed ? "Couldn't load Vendors — try reloading" : "No matching Vendor"}
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
              emptyMessage={reference.loadFailed ? "Couldn't load Categories — try reloading" : "No matching Category"}
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
        <h2 className="mb-3 text-card-title text-ink-900">Equipment used</h2>
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
              ? "Couldn't load the registers — try reloading"
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
                    emptyMessage={reference.loadFailed ? "Couldn't load Vendors — try reloading" : "No matching Vendor"}
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
                    reference.loadFailed ? "Couldn't load the registers — try reloading" : "No matching Machinery or Vehicle"
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
                <TextField
                  label="Notes"
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
                              // Review fix (finding #5): an ACTUAL change of
                              // Subcontractor invalidates a previously
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
              emptyMessage={reference.loadFailed ? "Couldn't load Subcontractors — try reloading" : "No matching Subcontractor"}
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
                emptyMessage="No matching Site Contract for this Site"
                onCreateNew={row.subcontractorId ? () => setSiteContractQuickCreateRow(index) : undefined}
                createNewLabel="+ Create Site Contract"
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Quantity completed"
                type="number"
                min={0}
                step="any"
                disabled={!isPickedContractActive(row)}
                hint={!row.siteContractId ? "Pick a Contract" : isPickedContractActive(row) ? "Optional" : "Needs an Active Contract"}
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
        <p className="mb-3 text-body-sm text-ink-500">
          Pick a named Labourer, log a quick Men/Women/Mistri headcount, or both — at least one is required per row.
        </p>
        {labourEntries.map((row, index) => (
          <div
            key={row.clientGeneratedId}
            className="mb-3 grid grid-cols-1 gap-x-3 gap-y-2 border-b border-border-hairline pb-3 sm:grid-cols-12 sm:items-start"
          >
            <ComboboxField
              label="Labour"
              className="sm:col-span-12"
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
              emptyMessage={reference.loadFailed ? "Couldn't load Labour — try reloading" : "No matching Labour"}
              onCreateNew={() => setLabourerQuickCreateRow(index)}
              createNewLabel="+ Add Labour"
            />
            {/* Own row, generously wide (1/3 each) — a narrower shared row
                with the Labour picker overflowed the "Optional" hint text
                into the neighbouring column at smaller viewports.
                TextField (unlike ComboboxField) applies `className` to its
                inner <input>, not its outer wrapper — col-span must go on a
                wrapping div, same pattern as "Quantity completed" below. */}
            <div className="sm:col-span-4">
              <TextField
                label="Men"
                type="number"
                min={0}
                step="1"
                value={row.men}
                onChange={(e) => setLabourEntries((rows) => rows.map((r, i) => (i === index ? { ...r, men: e.target.value } : r)))}
              />
            </div>
            <div className="sm:col-span-4">
              <TextField
                label="Women"
                type="number"
                min={0}
                step="1"
                value={row.women}
                onChange={(e) => setLabourEntries((rows) => rows.map((r, i) => (i === index ? { ...r, women: e.target.value } : r)))}
              />
            </div>
            <div className="sm:col-span-4">
              <TextField
                label="Mistri"
                type="number"
                min={0}
                step="1"
                value={row.mistri}
                onChange={(e) => setLabourEntries((rows) => rows.map((r, i) => (i === index ? { ...r, mistri: e.target.value } : r)))}
              />
            </div>
            <div className="sm:col-span-12 flex sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setLabourEntries((rows) => rows.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setLabourEntries((rows) => [
              ...rows,
              { clientGeneratedId: crypto.randomUUID(), labourerId: null, men: "", women: "", mistri: "" },
            ])
          }
        >
          <PlusIcon className="size-4" />
          Add labour
        </Button>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Site Photos</h2>
        {/* spec-dsr-photo-management: already-uploaded photos (edit mode
            only) — same thumbnail the detail page renders via
            PhotoThumbnail, each with its own immediate Remove. */}
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
                  className="flex items-center gap-1 text-caption text-ink-500 underline disabled:opacity-50"
                >
                  <TrashIcon className="size-3" />
                  {removingPhotoId === photo.id ? "Removing…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {/* AC #3: drag-drop dropzone — desktop's platform-appropriate input
            method, same underlying presign/upload/confirm flow as mobile's
            camera tap (apps/web/lib/photo-upload.ts, story 3.3). */}
        <button
          type="button"
          disabled={submittedDsrId !== null}
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(e: DragEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e: DragEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsDraggingOver(false);
            addPhotoFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-body-sm text-ink-500 transition-colors disabled:opacity-50 ${
            isDraggingOver ? "border-accent-teal-700 bg-accent-teal-100 text-accent-teal-700" : "border-border-strong"
          }`}
        >
          <CameraIcon className="size-6" />
          {submittedDsrId
            ? "Report submitted — finishing photo uploads"
            : "Drag and drop photos here, or click to select"}
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotoFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {photos.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.localId} className="flex w-16 flex-col items-center gap-1">
                <div className="relative size-16 overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local
                      blob: preview of a just-selected/dropped File. */}
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
                {/* Honest affordances per status: pending (pre-submit) can be
                    removed; failed offers Retry AND Remove (removing the last
                    failed photo is a legitimate way to unblock navigation);
                    uploading and uploaded offer nothing — an uploaded photo
                    is already attached to the server-side report, so a local
                    "Remove" would be a lie. */}
                {photo.status === "failed" ? (
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => retryPhoto(photo.localId)}
                      className="flex items-center gap-1 text-caption text-danger-700 underline"
                    >
                      <RotateCcwIcon className="size-3" />
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.localId)}
                      className="text-caption text-ink-500 underline"
                    >
                      Remove
                    </button>
                  </span>
                ) : photo.status === "pending" ? (
                  <button type="button" onClick={() => removePhoto(photo.localId)} className="text-caption text-ink-500 underline">
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {error ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={!siteId || (mode === "correct" && !reason) || submittedDsrId !== null}
        className="w-full justify-center"
      >
        {mode === "correct" ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
        {mode === "correct" ? "Save Edit" : "Submit Daily Report"}
      </Button>

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Save this edit?"
        description="This supersedes the original report with the restated details below — the original stays on record (AD-9)."
        confirmLabel="Save Edit"
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Crew present" value={crew.filter((c) => c.attended).length} />
        <ConfirmDialogRow label="Materials Used" value={consumptions.filter((c) => c.materialSizeId && c.quantity).length} />
        <ConfirmDialogRow label="RMC deliveries" value={rmcEntries.filter((r) => r.vendorId && r.quantityM3).length} />
        <ConfirmDialogRow label="Expenses" value={expenses.filter((e) => e.categoryId && e.amount).length} />
        <ConfirmDialogRow label="Waste Material" value={wasteEntries.filter(isWasteRowComplete).length} />
        <ConfirmDialogRow label="Subcontractors" value={subcontractorEntries.filter((s) => s.subcontractorId).length} />
        <ConfirmDialogRow label="Labour" value={labourEntries.filter(isLabourRowComplete).length} />
        <ConfirmDialogRow label="Reason" value={reason || "—"} />
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
      {siteContractQuickCreateRow !== null && subcontractorEntries[siteContractQuickCreateRow]?.subcontractorId ? (
        <SiteContractQuickCreateModal
          open={siteContractQuickCreateRow !== null}
          onOpenChange={(open) => {
            if (!open) setSiteContractQuickCreateRow(null);
          }}
          siteId={siteId}
          subcontractorId={subcontractorEntries[siteContractQuickCreateRow]!.subcontractorId!}
          onSuccess={(contract) => {
            const index = siteContractQuickCreateRow;
            if (index !== null) {
              setSubcontractorEntries((rows) => rows.map((r, i) => (i === index ? { ...r, siteContractId: contract.id } : r)));
            }
            setSiteContractQuickCreateRow(null);
            setSiteContractRefreshKey((k) => k + 1);
          }}
        />
      ) : null}
    </form>
  );
}
