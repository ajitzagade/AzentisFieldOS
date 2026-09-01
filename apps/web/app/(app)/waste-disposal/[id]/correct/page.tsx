import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { HelpBubble } from "@azentisfieldos/ui";
import { WasteDisposalForm, type WasteDisposalFormInitialValues } from "../../waste-disposal-form";

// The same explanation Help & Guides shows for the Correct concept — one
// shared content source, read here inline (same pattern as the Consumption
// page's contextual help).
const CORRECT_HELP = HELP_CONTENT.contextualHelp.find((h) => h.key === "correct");

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

interface WasteDisposalForCorrection {
  id: string;
  siteId: string;
  wasteType: string;
  quantityDetails: string | null;
  ownership: "OWN" | "HIRED";
  vendorId: string | null;
  machineryId: string | null;
  vehicleId: string | null;
  vehicleDetails: string | null;
  tripCount: number;
  ratePerTrip: string;
  // Prisma Decimal — serialized as a string over JSON.
  otherCharges: string | null;
  disposalLocation: string | null;
  notes: string | null;
  disposedAt: string;
}

async function getDisposal(id: string): Promise<WasteDisposalForCorrection | null> {
  const res = await authedFetch(`/waste-disposals/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Waste Disposal (${res.status})`);
  }
  return res.json();
}

async function getList<T>(path: string): Promise<T[]> {
  const res = await authedFetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

// The row's "Correct" action, never Edit/Delete (AD-9) — pre-fills the
// locked fields from the entry being corrected; trips/other charges are
// intentionally blank since a correction enters signed deltas, not
// restated totals (same reasoning as CorrectExpensePage).
export default async function CorrectWasteDisposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [disposal, sites, vendors] = await Promise.all([
    getDisposal(id),
    getList<SiteOption>(`/sites`),
    getList<VendorOption>(`/vendors`),
  ]);
  if (!disposal) {
    notFound();
  }

  const initial: WasteDisposalFormInitialValues = {
    siteId: disposal.siteId,
    wasteType: disposal.wasteType,
    quantityDetails: disposal.quantityDetails ?? undefined,
    ownership: disposal.ownership,
    vendorId: disposal.vendorId ?? undefined,
    machineryId: disposal.machineryId ?? undefined,
    vehicleId: disposal.vehicleId ?? undefined,
    vehicleDetails: disposal.vehicleDetails ?? undefined,
    // The original trips/other charges — correct mode shows them so the
    // user types corrected values and the form derives the signed deltas.
    tripCount: disposal.tripCount,
    otherCharges: disposal.otherCharges ?? undefined,
    ratePerTrip: disposal.ratePerTrip,
    disposalLocation: disposal.disposalLocation ?? undefined,
    notes: disposal.notes ?? undefined,
    disposedAt: disposal.disposedAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/waste-disposal" className="hover:text-accent-teal-700 hover:underline">
          Waste &amp; Disposal
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 flex items-center gap-2 text-page-title text-ink-900">
        Correct Waste Disposal
        {CORRECT_HELP ? <HelpBubble>{CORRECT_HELP.explanation}</HelpBubble> : null}
      </h1>
      <WasteDisposalForm mode="correct" correctsId={disposal.id} sites={sites} vendors={vendors} equipment={[]} initial={initial} />
    </div>
  );
}
