import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  ClipboardIcon,
  DataTable,
  SelectField,
  TextField,
  type DataTableColumn,
} from "@azentisfieldos/ui";

interface AuditLogRow {
  id: string;
  occurredAt: string;
  method: "POST" | "PATCH" | "DELETE";
  action: string;
  entityType: string | null;
  entityId: string | null;
  siteId: string | null;
  siteName: string | null;
  user: { name: string };
}

interface SiteOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
}

interface Filters {
  siteId?: string;
  userId?: string;
  from?: string;
  to?: string;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await authedFetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

function formatDateTime(iso: string): string {
  // Rendered server-side — pin the tenant's zone (same convention as the
  // dashboard heading) or a UTC host shifts every timestamp by 5.5 hours.
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

const METHOD_BADGE: Record<AuditLogRow["method"], { variant: "success" | "warning" | "danger"; label: string }> = {
  POST: { variant: "success", label: "Create" },
  PATCH: { variant: "warning", label: "Update" },
  DELETE: { variant: "danger", label: "Delete" },
};

const columns: DataTableColumn<AuditLogRow>[] = [
  { header: "When", cell: (r) => <span className="text-ink-500">{formatDateTime(r.occurredAt)}</span> },
  { header: "Who", cell: (r) => <span className="font-semibold">{r.user.name}</span> },
  {
    header: "What",
    cell: (r) => {
      const badge = METHOD_BADGE[r.method] ?? { variant: "warning" as const, label: r.method };
      return (
        <span className="flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {r.action}
        </span>
      );
    },
  },
  {
    header: "Site",
    cell: (r) => r.siteName ?? <span className="text-ink-500">—</span>,
  },
];

// Owner/Admin-only audit trail (defence-in-depth with the API's 403): every
// create/update/correction/delete in the system, newest first — who did
// what, on which Site, when. Rows are written automatically by the API and
// can never be edited or removed.
export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<Filters>;
} = {}) {
  const me = await getJSON<{ role: string }>("/users/me");
  if (me.role !== "OWNER_ADMIN") notFound();

  const filters = (await searchParams) ?? {};
  const params = new URLSearchParams();
  if (filters.siteId) params.set("siteId", filters.siteId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();

  const [rows, sites, users] = await Promise.all([
    getJSON<AuditLogRow[]>(`/audit-logs${qs ? `?${qs}` : ""}`),
    getJSON<SiteOption[]>(`/sites`),
    getJSON<UserOption[]>(`/users`),
  ]);

  // GET /sites hides soft-deleted Sites, but the trail's whole point is
  // tracing them — augment the filter options with any Site the returned
  // rows (or the active filter) reference that the list no longer carries.
  const siteOptions = [...sites];
  const knownSiteIds = new Set(sites.map((s) => s.id));
  for (const row of rows) {
    if (row.siteId && row.siteName && !knownSiteIds.has(row.siteId)) {
      knownSiteIds.add(row.siteId);
      siteOptions.push({ id: row.siteId, name: `${row.siteName} (deleted)` });
    }
  }

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/settings" className="hover:text-accent-teal-700 hover:underline">
          Settings
        </Link>{" "}
        / Audit Log
      </div>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Audit Log</h1>
        <p className="text-body-sm text-ink-500">
          Every change recorded in the system — who made it, what it was, on which Site, and when.
          Entries are written automatically and can never be edited or deleted. Showing the most
          recent 200 within the selected window.
        </p>
      </div>

      <form method="GET" action="/settings/audit-log" className="mb-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SelectField
          label="Site"
          name="siteId"
          defaultValue={filters.siteId ?? ""}
          options={[{ value: "", label: "All Sites" }, ...siteOptions.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <SelectField
          label="User"
          name="userId"
          defaultValue={filters.userId ?? ""}
          options={[{ value: "", label: "All Users" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
        />
        <TextField label="From" name="from" type="date" defaultValue={filters.from ?? ""} />
        <TextField label="To" name="to" type="date" defaultValue={filters.to ?? ""} />
        <div className="mb-4">
          <Button type="submit" variant="secondary" className="w-full justify-center">
            Apply filters
          </Button>
        </div>
      </form>

      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={
          rows.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No audit entries in this window yet — they appear as changes are made.",
              }
            : { status: "success", rows }
        }
      />
    </>
  );
}
