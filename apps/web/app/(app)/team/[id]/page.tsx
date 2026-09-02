import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Badge,
  Card,
  ClipboardIcon,
  CorrectAction,
  DataTable,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import type { TeamMemberDetail } from "./edit/page";

interface WorkHistoryEntry {
  id: string;
  workDate: string;
  attended: boolean;
  hours: string | null;
  overtimeHours: string | null;
  site: { id: string; name: string };
}

interface AdvanceListItem {
  id: string;
  amount: string;
  reason: string | null;
  givenAt: string;
  teamMember: { id: string };
}

interface AdjustmentListItem {
  id: string;
  amount: string;
  note: string | null;
  adjustedAt: string;
  advance: { id: string; teamMember: { id: string } };
}

// The combined Advance Ledger: Story 7.1 produces Advance rows, Story 7.2
// adds AdvanceAdjustment rows here — never a separate table per
// transaction type (same convention as /movements' combined log).
interface LedgerRow {
  id: string;
  sortKey: number;
  date: string;
  typeBadge: ReactNode;
  reason: string | null;
  amount: string;
  actions: ReactNode;
}

async function getTeamMember(id: string): Promise<TeamMemberDetail | null> {
  const res = await authedFetch(`/team-members/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Team Member (${res.status})`);
  }
  return res.json();
}

async function getWorkHistory(id: string): Promise<WorkHistoryEntry[]> {
  const res = await authedFetch(`/team-members/${id}/work-history`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Work Record History (${res.status})`);
  }
  return res.json();
}

// Epic 7 scope entirely — GET /advances is the same global list a future
// combined Advances page will also read; there is no per-Team-Member
// endpoint, so this page filters client-side.
async function getAdvances(id: string): Promise<AdvanceListItem[]> {
  const res = await authedFetch(`/advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Advances (${res.status})`);
  }
  const advances: AdvanceListItem[] = await res.json();
  return advances.filter((a) => a.teamMember.id === id);
}

async function getAdjustments(id: string): Promise<AdjustmentListItem[]> {
  const res = await authedFetch(`/advance-adjustments`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Advance Adjustments (${res.status})`);
  }
  const adjustments: AdjustmentListItem[] = await res.json();
  return adjustments.filter((a) => a.advance.teamMember.id === id);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(amount: string) {
  const value = Number(amount);
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

// canManage gates Adjust/Correct too, not just the top-level "Record
// Advance" button — both ultimately POST to the same OWNER_ADMIN-gated
// /advances and /advance-adjustments endpoints (AD-9: a correction is just
// another write to the same create path), so a Supervisor must not see an
// action that would 403 on submit.
function advanceToLedgerRow(a: AdvanceListItem, canManage: boolean): LedgerRow {
  return {
    id: a.id,
    sortKey: new Date(a.givenAt).getTime(),
    date: formatDate(a.givenAt),
    typeBadge: <Badge variant="gold">Advance</Badge>,
    reason: a.reason,
    amount: a.amount,
    actions: canManage ? (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/team/${a.teamMember.id}/advances/${a.id}/adjustments/new`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <PlusIcon className="size-4" />
          Adjust
        </Link>
        <CorrectAction icon={<RotateCcwIcon className="size-4" />} href={`/team/${a.teamMember.id}/advances/${a.id}/correct`} />
      </div>
    ) : null,
  };
}

function adjustmentToLedgerRow(adj: AdjustmentListItem, canManage: boolean): LedgerRow {
  const teamMemberId = adj.advance.teamMember.id;
  return {
    id: adj.id,
    sortKey: new Date(adj.adjustedAt).getTime(),
    date: formatDate(adj.adjustedAt),
    typeBadge: <Badge variant="neutral">Adjustment</Badge>,
    reason: adj.note,
    // Adjustment.amount is stored as the decrement magnitude (positive
    // reduces the balance) — the opposite sign convention from Advance's
    // amount (positive increases it) — negated here so the ledger's
    // Amount column always reads as this row's signed effect on the
    // balance, matching 09-team-member-detail.html's "−₹3,000" copy.
    amount: String(-Number(adj.amount)),
    actions: canManage ? (
      <div className="flex justify-end">
        <CorrectAction
          icon={<RotateCcwIcon className="size-4" />}
          href={`/team/${teamMemberId}/advances/${adj.advance.id}/adjustments/${adj.id}/correct`}
        />
      </div>
    ) : null,
  };
}

const columns: DataTableColumn<WorkHistoryEntry>[] = [
  { header: "Date", cell: (w) => formatDate(w.workDate) },
  { header: "Site", cell: (w) => w.site.name },
  {
    header: "Attendance",
    cell: (w) => (w.attended ? <Badge variant="success">Present</Badge> : <Badge variant="danger">Absent</Badge>),
  },
  {
    header: "Hours / OT",
    align: "right",
    cell: (w) =>
      w.attended ? (
        <span className="tabular-nums">
          {w.hours ?? "—"}h{w.overtimeHours ? ` / ${w.overtimeHours}h OT` : ""}
        </span>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
];

const ledgerColumns: DataTableColumn<LedgerRow>[] = [
  { header: "Date", cell: (r) => r.date },
  { header: "Type", cell: (r) => r.typeBadge },
  { header: "Reason", cell: (r) => r.reason ?? <span className="text-ink-500">—</span> },
  { header: "Amount", align: "right", cell: (r) => <span className="tabular-nums">{formatMoney(r.amount)}</span> },
  { header: "", cell: (r) => r.actions },
];

export default async function TeamMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [role, teamMember, workHistory, advances, adjustments] = await Promise.all([
    currentRole(),
    getTeamMember(id),
    getWorkHistory(id),
    getAdvances(id),
    getAdjustments(id),
  ]);
  // Advances are Owner/Admin-only money movement (apps/api's AdvancesController
  // enforces this server-side) — hide the entry point for a Supervisor rather
  // than let them submit the form and hit a 403.
  const canRecordAdvance = role === "OWNER_ADMIN";

  if (!teamMember) {
    notFound();
  }

  const ledgerRows = [
    ...advances.map((a) => advanceToLedgerRow(a, canRecordAdvance)),
    ...adjustments.map((adj) => adjustmentToLedgerRow(adj, canRecordAdvance)),
  ].sort(
    (a, b) => b.sortKey - a.sortKey,
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const mostRecent = workHistory[0];
  const currentSite = mostRecent?.site.name ?? null;
  const isToday = mostRecent && mostRecent.workDate.slice(0, 10) === todayStr;

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/team" className="hover:text-accent-teal-700 hover:underline">
          Team &amp; Labour
        </Link>{" "}
        / {teamMember.name}
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-page-title text-ink-900">
            {teamMember.name}
            {!teamMember.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-body-sm">
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Employment type</span>
              <Badge variant="neutral">{teamMember.employmentType.name}</Badge>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Contact</span>
              <span className="font-semibold text-ink-900">{teamMember.contact ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Current / Last Site</span>
              <span className="font-semibold text-ink-900">{currentSite ?? "—"}</span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-ink-500">Today&apos;s attendance</span>
              {isToday ? (
                mostRecent.attended ? (
                  <Badge variant="success">Present</Badge>
                ) : (
                  <Badge variant="danger">Absent</Badge>
                )
              ) : (
                <span className="text-ink-500">—</span>
              )}
            </span>
          </div>
        </div>
        <Link href={`/team/${teamMember.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
          <PencilIcon className="size-4" />
          Edit
        </Link>
      </div>

      <div className="mb-4 text-section-header text-ink-900">Work Record History</div>
      <DataTable
        columns={columns}
        rowKey={(w) => w.id}
        state={
          workHistory.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No Work Records yet for this Team Member.",
              }
            : { status: "success", rows: workHistory }
        }
      />

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="text-section-header text-ink-900">Advance Ledger</div>
        {canRecordAdvance ? (
          <Link href={`/team/${teamMember.id}/advances/new`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <PlusIcon className="size-4" />
            Record Advance
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <div className="text-eyebrow text-ink-500">Outstanding Balance</div>
          <div className="mt-1 text-kpi-numeral tabular-nums text-ink-900">
            ₹{Number(teamMember.outstandingAdvanceBalance).toLocaleString("en-IN")}
          </div>
          <p className="mt-2 text-caption text-ink-500">Total Advance − Total Adjusted</p>
        </Card>

        <DataTable
          columns={ledgerColumns}
          rowKey={(r) => r.id}
          state={
            ledgerRows.length === 0
              ? {
                  status: "empty",
                  icon: <WalletIcon />,
                  message: "No Advances recorded yet for this Team Member.",
                }
              : { status: "success", rows: ledgerRows }
          }
        />
      </div>
    </>
  );
}
