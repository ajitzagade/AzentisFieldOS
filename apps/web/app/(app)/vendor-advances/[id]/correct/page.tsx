import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VendorAdvanceCorrectForm } from "../../vendor-advance-correct-form";

interface VendorAdvanceForCorrection {
  id: string;
  vendorId: string;
  amount: string;
  paymentMethod: string | null;
  wasteDisposal: { id: string; wasteType: string } | null;
}

async function getVendorAdvance(id: string): Promise<VendorAdvanceForCorrection | null> {
  const res = await authedFetch(`/vendor-advances/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Vendor Advance (${res.status})`);
  }
  return res.json();
}

// The row's "Correct" action on the Vendor detail page's Vendor Advances
// table — pre-fills from the Advance being corrected, submits to the same
// POST /vendor-advances every correction goes through (correctsId set
// here), same pattern as every other correctable entity in the app.
export default async function CorrectVendorAdvancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const advance = await getVendorAdvance(id);
  if (!advance) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href={`/vendors/${advance.vendorId}`} className="hover:text-accent-teal-700 hover:underline">
          Vendor
        </Link>{" "}
        / Correct Advance
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Vendor Advance</h1>
      <VendorAdvanceCorrectForm
        correctsId={advance.id}
        originalAmount={Number(advance.amount)}
        initialPaymentMethod={advance.paymentMethod ?? undefined}
      />
    </div>
  );
}
