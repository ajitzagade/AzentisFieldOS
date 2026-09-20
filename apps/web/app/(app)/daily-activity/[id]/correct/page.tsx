import { randomUUID } from "node:crypto";
import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { DsrEquipmentUsed } from "@azentisfieldos/shared";
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
  subcontractorEntries: { subcontractorId: string; workNote?: string }[];
  labourEntries: { category: string; men: number; women: number }[];
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
    })),
    labourEntries: (dsr.labourEntries ?? []).map((l) => ({
      category: l.category,
      men: String(l.men),
      women: String(l.women),
    })),
  };

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
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Daily Report — {dsr.site.name}</h1>

      <DsrDesktopForm mode="correct" originalId={dsr.id} initial={initial} />
    </>
  );
}
