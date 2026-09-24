import { randomUUID } from "node:crypto";
import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { DsrEquipmentUsed } from "@azentisfieldos/shared";
import { AlertTriangleIcon } from "@azentisfieldos/ui";
import { DsrDesktopForm, type DsrFormInitialValues } from "../../_components/dsr-desktop-form";

interface DsrForCorrection {
  id: string;
  site: { id: string; name: string };
  reportDate: string;
  workCompleted: string | null;
  issuesBlockers: string | null;
  equipmentUsed: DsrEquipmentUsed[];
  workRecords: { teamMemberId: string; teamMember: { name: string }; attended: boolean }[];
  consumptions: { materialSizeId: string; quantity: number; activityReference: string | null }[];
  // Nullable (goal 1) — a delivery may be recorded before pricing exists.
  rmcEntries: { vendorId: string; quantityM3: number; grade: string; ratePerM3: number | null }[];
  expenses: { categoryId: string; amount: number; description: string | null }[];
  // goal 4: siteContractId/quantity are additive/optional — absent on a
  // historical row's JSON, present on a row that was linked to a real Site
  // Contract at submit time. clientGeneratedId MUST be threaded through to
  // the form pre-fill unchanged (see withPreservedRowIds in
  // dsr-desktop-form.tsx) — it's how dsr.service.ts's correct() resolves
  // the ORIGINAL SubcontractorWorkEntry to link the correctsId chain and
  // compute the restated quantity delta; a fresh id would silently
  // double-count against SiteContract.quantityCompleted.
  subcontractorEntries: {
    subcontractorId: string;
    workNote?: string;
    siteContractId?: string;
    quantity?: number;
    clientGeneratedId?: string;
  }[];
  // spec-dsr-labour-dropdown, revised 2026-09-24: a historical DSR may carry
  // either shape — the new {labourerId?, men?, women?, mistri?} shape (a
  // report already using the picker/headcount form) or the legacy free-text
  // {category, men, women} shape (a report from before either existed).
  // Only the new shape is representable in the correction form; see the
  // pre-fill mapping below.
  labourEntries: (
    | { labourerId?: string; men?: number; women?: number; mistri?: number }
    | { category: string; men: number; women: number }
  )[];
  // goal 3: real WasteDisposal rows materialized against this DSR (findOne's
  // `wasteDisposalEntries: { include: { vendor: true } }`) — pre-fills the
  // desktop correction form's own Waste Material section the same way
  // rmcEntries pre-fills RMC above. clientGeneratedId MUST be threaded
  // through unchanged — same reasoning as subcontractorEntries above,
  // dsr.service.ts's correct() resolves the ORIGINAL WasteDisposal row via
  // this exact id to link correctsId and compute the restated delta
  // (WasteDisposalService.summary() would otherwise double-count).
  wasteDisposalEntries: {
    clientGeneratedId: string | null;
    wasteType: string;
    quantityDetails: string | null;
    ownership: "OWN" | "HIRED";
    vendorId: string | null;
    machineryId: string | null;
    vehicleId: string | null;
    vehicleDetails: string | null;
    tripCount: number;
    ratePerTrip: number | null;
    otherCharges: number | null;
    paymentStatus: string | null;
    disposalLocation: string | null;
    notes: string | null;
  }[];
  // spec-dsr-photo-management: findOne's `photos` pre-fills the Edit form's
  // existing-photos section, same shape the detail page already renders via
  // PhotoThumbnail. NOTE: dsr.service.ts's findOne/getDraft still need a
  // `deletedAt: null` filter added to their `photos` include (out of scope
  // here — concurrently owned by another change; see report at end of task).
  photos: { id: string; url: string }[];
}

async function getDsr(id: string): Promise<DsrForCorrection | null> {
  const res = await authedFetch(`/dsr/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Daily Report (${res.status})`);
  }
  return res.json();
}

// AC #2/#4: pre-fills from the report being corrected, submits to
// POST /dsr/:id/correct — a brand-new, linked entry, never an edit of the
// original (AD-9, FR-54).
export default async function CorrectDsrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dsr = await getDsr(id);
  if (!dsr) {
    notFound();
  }

  const initial: DsrFormInitialValues = {
    siteId: dsr.site.id,
    // GET /dsr/:id serializes the Prisma DateTime as full ISO
    // ("2026-09-19T00:00:00.000Z"), but the form's date input and
    // createDsrSchema's z.iso.date() both need plain YYYY-MM-DD — passing
    // it through verbatim rendered an empty Date field and made every
    // correction submit 400.
    reportDate: dsr.reportDate.slice(0, 10),
    workCompleted: dsr.workCompleted ?? "",
    issuesBlockers: dsr.issuesBlockers ?? "",
    workRecords: dsr.workRecords.map((w) => ({ teamMemberId: w.teamMemberId, name: w.teamMember.name, attended: w.attended })),
    consumptions: dsr.consumptions.map((c) => ({
      materialSizeId: c.materialSizeId,
      quantity: String(c.quantity),
      activityReference: c.activityReference ?? "",
    })),
    rmcEntries: dsr.rmcEntries.map((r) => ({
      vendorId: r.vendorId,
      quantityM3: String(r.quantityM3),
      grade: r.grade,
      ratePerM3: r.ratePerM3 != null ? String(r.ratePerM3) : "",
    })),
    expenses: dsr.expenses.map((e) => ({ categoryId: e.categoryId, amount: String(e.amount), description: e.description ?? "" })),
    // DsrEquipmentUsed's id/name are optional at the schema level (an OTHER
    // row's description is its record) — the desktop form's own EquipmentRow
    // always carries a real id/name (even OTHER rows get a client-generated
    // one when added), so fall back defensively here rather than widen that
    // invariant everywhere it's relied on.
    equipmentUsed: dsr.equipmentUsed.map((e) => ({
      type: e.type,
      id: e.id ?? randomUUID(),
      name: e.name ?? (e.type === "OTHER" ? "Other Vehicle" : "Equipment"),
      description: e.description,
    })),
    subcontractorEntries: (dsr.subcontractorEntries ?? []).map((s) => ({
      subcontractorId: s.subcontractorId,
      workNote: s.workNote ?? "",
      siteContractId: s.siteContractId ?? null,
      quantity: s.quantity != null ? String(s.quantity) : "",
      clientGeneratedId: s.clientGeneratedId,
    })),
    // spec-dsr-labour-dropdown, revised 2026-09-24: the new shape
    // ({labourerId?, men?, women?, mistri?}) is fully representable in the
    // form now — a row is anything WITHOUT `category` (the legacy shape's
    // one distinguishing field). Only true pre-dropdown legacy rows are
    // still not carried forward (droppedLegacyLabourCount below).
    labourEntries: (dsr.labourEntries ?? [])
      .filter((l): l is { labourerId?: string; men?: number; women?: number; mistri?: number } => !("category" in l))
      .map((l) => ({
        labourerId: l.labourerId ?? null,
        men: l.men != null ? String(l.men) : "",
        women: l.women != null ? String(l.women) : "",
        mistri: l.mistri != null ? String(l.mistri) : "",
      })),
    // goal 3: NOTE — unlike the mobile form's Save-Draft/Resume path, this
    // read comes straight from findOne's real WasteDisposal rows (not the
    // draftContent gap noted in dsr/new/page.tsx), so a correction here
    // reliably pre-fills every prior Waste Material trip.
    wasteDisposalEntries: (dsr.wasteDisposalEntries ?? []).map((w) => ({
      clientGeneratedId: w.clientGeneratedId ?? undefined,
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
    // spec-dsr-photo-management: pre-fills DsrDesktopForm's existing-photos
    // section (rendered alongside the new-upload dropzone) — see that
    // component for the Remove flow.
    photos: dsr.photos,
  };

  // spec-dsr-labour-dropdown: how many of the original report's Labour rows
  // use the pre-dropdown legacy {category, men, women} shape and can't be
  // carried into this form — without this, they'd silently disappear from
  // the edited version the moment it's submitted (AD-9 keeps the original's
  // raw data intact, but the "current" view going forward would under-report
  // Labour with no indication why).
  const droppedLegacyLabourCount = (dsr.labourEntries ?? []).filter((l) => "category" in l).length;

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/daily-activity" className="hover:text-accent-teal-700 hover:underline">
          Daily Reports
        </Link>{" "}
        /{" "}
        <Link href={`/daily-activity/${dsr.id}`} className="hover:text-accent-teal-700 hover:underline">
          {dsr.site.name}
        </Link>{" "}
        / Edit
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Edit Daily Report — {dsr.site.name}</h1>

      {droppedLegacyLabourCount > 0 ? (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-warning-100 p-3 text-body-sm text-warning-700">
          <AlertTriangleIcon className="size-5 shrink-0" />
          {droppedLegacyLabourCount} Labour {droppedLegacyLabourCount === 1 ? "entry uses" : "entries use"} an older
          format and can't be carried into this form — re-add them below if still relevant, or they won't appear on
          the edited version.
        </p>
      ) : null}

      <DsrDesktopForm mode="correct" originalId={dsr.id} initial={initial} />
    </>
  );
}
