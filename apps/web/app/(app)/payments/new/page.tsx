import { PaymentForm } from "../payment-form";

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

async function getTeamMembers(): Promise<TeamMemberListItem[]> {
  const res = await fetch(`${process.env.API_URL}/team-members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Members (${res.status})`);
  }
  return res.json();
}

async function getAdvances(): Promise<AdvanceListItem[]> {
  const res = await fetch(`${process.env.API_URL}/advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Advances (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function NewPaymentPage() {
  const [teamMembers, advances] = await Promise.all([getTeamMembers(), getAdvances()]);

  const advanceOptions = advances.map((a) => ({
    id: a.id,
    teamMemberId: a.teamMember.id,
    label: `₹${Number(a.amount).toLocaleString("en-IN")} — ${formatDate(a.givenAt)}${a.reason ? ` (${a.reason})` : ""}`,
  }));

  return (
    <div className="max-w-160">
      <h1 className="mb-1 text-page-title text-ink-900">Record Payment</h1>
      <p className="mb-6 text-body-sm text-ink-500">Base + Additional − Deductions − Advance Adjustment = Net Payable</p>
      <PaymentForm mode="new" teamMembers={teamMembers} advances={advanceOptions} />
    </div>
  );
}
