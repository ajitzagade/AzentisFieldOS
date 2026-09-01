import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { HelpBubble } from "@azentisfieldos/ui";
import { RmcForm, type RmcFormInitialValues } from "../../rmc-form";

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

interface RmcEntryForCorrection {
  id: string;
  siteId: string;
  vendorId: string;
  grade: string;
  // Prisma Decimal — serialized as a string over JSON.
  quantityM3: string;
  ratePerM3: string;
  totalAmount: string;
  invoiceOrChallanNo: string | null;
  challanPhotoUrl: string | null;
  deliveredAt: string;
}

async function getRmcEntry(id: string): Promise<RmcEntryForCorrection | null> {
  const res = await authedFetch(`/rmc-entries/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load RMC delivery (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getVendors(): Promise<VendorOption[]> {
  const res = await authedFetch(`/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

// AC #3: the row's "Correct" action, never Edit/Delete — pre-fills from
// the RMC delivery being corrected and submits to the same POST
// /rmc-entries as a plain create, with correctsId (set here) telling the
// API this is a correction rather than a route split.
export default async function CorrectRmcEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [entry, sites, vendors] = await Promise.all([getRmcEntry(id), getSites(), getVendors()]);
  if (!entry) {
    notFound();
  }

  const initial: RmcFormInitialValues = {
    siteId: entry.siteId,
    vendorId: entry.vendorId,
    grade: entry.grade,
    // The original quantity/total — correct mode shows them so the user
    // types corrected values and the form derives the signed deltas.
    quantityM3: entry.quantityM3,
    ratePerM3: entry.ratePerM3,
    totalAmount: entry.totalAmount,
    invoiceOrChallanNo: entry.invoiceOrChallanNo ?? undefined,
    challanPhotoUrl: entry.challanPhotoUrl ?? undefined,
    deliveredAt: entry.deliveredAt.slice(0, 10),
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/rmc" className="hover:text-accent-teal-700 hover:underline">
          RMC
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 flex items-center gap-2 text-page-title text-ink-900">
        Correct RMC Delivery
        {CORRECT_HELP ? <HelpBubble>{CORRECT_HELP.explanation}</HelpBubble> : null}
      </h1>
      <RmcForm mode="correct" correctsId={entry.id} sites={sites} vendors={vendors} initial={initial} />
    </div>
  );
}
