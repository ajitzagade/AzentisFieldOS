import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentForm, type PaymentFormInitialValues } from "../../payment-form";

interface TeamMemberListItem {
  id: string;
  name: string;
  outstandingAdvanceBalance: string;
}

interface AdvanceListItem {
  id: string;
  amount: string;
  reason: string | null;
  givenAt: string;
  teamMember: { id: string };
}

interface PaymentForCorrection {
  id: string;
  basePay: string;
  additionalAmount: string;
  deductions: string;
  payPeriod: string | null;
  teamMember: { id: string; name: string };
  advanceAdjustments: { advanceId: string; amount: string; note: string | null }[];
}

async function getPayment(id: string): Promise<PaymentForCorrection | null> {
  const res = await authedFetch(`/payments/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Payment (${res.status})`);
  }
  return res.json();
}

async function getTeamMembers(): Promise<TeamMemberListItem[]> {
  const res = await authedFetch(`/team-members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Members (${res.status})`);
  }
  return res.json();
}

async function getAdvances(): Promise<AdvanceListItem[]> {
  const res = await authedFetch(`/advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Advances (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// AC #2: pre-fills from the Payment being corrected, submits to the same
// POST /payments as a plain create — correctsId (set here) tells the API
// this is a correction. Unlike Purchase/Advance's delta corrections, every
// field re-enters the original's complete value (Story 7.3's Dev Notes).
export default async function CorrectPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [role, payment, teamMembers, advances] = await Promise.all([
    currentRole(),
    getPayment(id),
    getTeamMembers(),
    getAdvances(),
  ]);
  if (role !== "OWNER_ADMIN" || !payment) {
    notFound();
  }

  const advanceOptions = advances.map((a) => ({
    id: a.id,
    teamMemberId: a.teamMember.id,
    label: `₹${Number(a.amount).toLocaleString("en-IN")} — ${formatDate(a.givenAt)}${a.reason ? ` (${a.reason})` : ""}`,
  }));

  const linkedAdjustment = payment.advanceAdjustments[0];

  const initial: PaymentFormInitialValues = {
    basePay: payment.basePay,
    additionalAmount: payment.additionalAmount,
    deductions: payment.deductions,
    payPeriod: payment.payPeriod ?? undefined,
    advanceAdjustment: linkedAdjustment
      ? { advanceId: linkedAdjustment.advanceId, amount: linkedAdjustment.amount, note: linkedAdjustment.note ?? undefined }
      : undefined,
  };

  return (
    <div className="max-w-160">
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/payments" className="hover:text-accent-teal-700 hover:underline">
          Payments
        </Link>{" "}
        / Correct
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Correct Payment</h1>
      <PaymentForm
        mode="correct"
        teamMembers={teamMembers}
        advances={advanceOptions}
        teamMemberId={payment.teamMember.id}
        correctsId={payment.id}
        initial={initial}
      />
    </div>
  );
}
