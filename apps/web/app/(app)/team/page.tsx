import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  Badge,
  CheckCircleIcon,
  DataTable,
  PlusIcon,
  StatTile,
  UsersIcon,
  WalletIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

export interface TeamMemberListItem {
  id: string;
  name: string;
  designation: string | null;
  isActive: boolean;
  employmentType: { id: string; name: string };
  currentOrLastSite: string | null;
  todaysAttendance: "PRESENT" | "ABSENT" | null;
}

interface TeamSummary {
  totalTeamMembers: number;
  todaysWorkingHeadcount: number;
  weeklyPaymentTotal: number;
  monthlyPaymentTotal: number;
}

interface OutstandingAdvancesByTeamMember {
  teamMemberId: string;
  name: string;
  outstandingAdvanceBalance: string;
}

interface OutstandingAdvances {
  total: number;
  byTeamMember: OutstandingAdvancesByTeamMember[];
}

async function getTeamMembers(): Promise<TeamMemberListItem[]> {
  const res = await authedFetch(`/team-members`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Members (${res.status})`);
  }
  return res.json();
}

async function getTeamSummary(): Promise<TeamSummary> {
  const res = await authedFetch(`/team-members/team-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Team Summary (${res.status})`);
  }
  return res.json();
}

// Story 7.4 (AC #1): the one shared Outstanding Advances number — Story
// 7.3's Payments list reads the same endpoint, never a second computation.
async function getOutstandingAdvances(): Promise<OutstandingAdvances> {
  const res = await authedFetch(`/team-members/outstanding-advances`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Outstanding Advances (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<TeamMemberListItem>[] = [
  {
    header: "Name",
    cell: (t) => (
      <span className="flex items-center gap-2 font-semibold">
        {t.name}
        {!t.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
  { header: "Role / Designation", cell: (t) => t.designation ?? <span className="text-ink-500">—</span> },
  { header: "Employment Type", cell: (t) => <Badge variant="neutral">{t.employmentType.name}</Badge> },
  {
    header: "Today's Attendance",
    cell: (t) =>
      t.todaysAttendance === "PRESENT" ? (
        <Badge variant="success">Present</Badge>
      ) : t.todaysAttendance === "ABSENT" ? (
        <Badge variant="danger">Absent</Badge>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
  { header: "Current / Last Site", cell: (t) => t.currentOrLastSite ?? <span className="text-ink-500">—</span> },
];

const outstandingAdvancesColumns: DataTableColumn<OutstandingAdvancesByTeamMember>[] = [
  { header: "Team Member", cell: (m) => m.name },
  {
    header: "Outstanding Balance",
    align: "right",
    cell: (m) => (
      <span className="font-semibold text-gold-700 tabular-nums">
        ₹{Number(m.outstandingAdvanceBalance).toLocaleString("en-IN")}
      </span>
    ),
  },
];

export default async function TeamPage() {
  const [teamMembers, teamSummary, outstandingAdvances] = await Promise.all([
    getTeamMembers(),
    getTeamSummary(),
    getOutstandingAdvances(),
  ]);
  // AC #2's drill-down: only Team Members who actually owe something —
  // the API's byTeamMember includes every Team Member (even a ₹0 balance)
  // so `total` above is complete, but a "who's owed" list showing every
  // fully-repaid Team Member alongside the ones who matter would bury the
  // signal.
  const owingTeamMembers = outstandingAdvances.byTeamMember.filter((m) => Number(m.outstandingAdvanceBalance) > 0);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Team &amp; Labour</h1>
          <p className="text-body-sm text-ink-500">Team Members across all active Sites, with today&apos;s attendance and Advance status</p>
        </div>
        <div className="flex gap-2">
          <Link href="/team/employment-types" className={cn(buttonVariants({ variant: "secondary" }))}>
            Employment Types
          </Link>
          <Link href="/daily-activity/work-records/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            Record Attendance
          </Link>
          <Link href="/team/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Add Team Member
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={<UsersIcon />} value={teamSummary.totalTeamMembers} label="Total Team Members" />
        <StatTile
          icon={<CheckCircleIcon />}
          value={teamSummary.todaysWorkingHeadcount}
          label="Today's working headcount"
          tint="success"
        />
        <StatTile
          icon={<WalletIcon />}
          value={`₹${outstandingAdvances.total.toLocaleString("en-IN")}`}
          label="Total Outstanding Advances"
          tint="gold"
        />
      </div>

      <DataTable
        columns={columns}
        rowKey={(t) => t.id}
        rowHref={(t) => `/team/${t.id}`}
        state={
          teamMembers.length === 0
            ? {
                status: "empty",
                icon: <UsersIcon />,
                message: "No Team Members yet.",
                action: (
                  <Link href="/team/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Add your first Team Member
                  </Link>
                ),
              }
            : { status: "success", rows: teamMembers }
        }
      />

      <div className="mb-4 mt-8 text-section-header text-ink-900">Outstanding Advances</div>
      <DataTable
        columns={outstandingAdvancesColumns}
        rowKey={(m) => m.teamMemberId}
        rowHref={(m) => `/team/${m.teamMemberId}`}
        state={
          owingTeamMembers.length === 0
            ? { status: "empty", icon: <WalletIcon />, message: "No Team Member currently has an Outstanding Advance." }
            : { status: "success", rows: owingTeamMembers }
        }
      />
    </>
  );
}
