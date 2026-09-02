import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ClipboardIcon, DataTable, PencilIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";
import type { Subcontractor } from "../page";
import { DeleteEntityButton } from "../../_components/delete-entity-button";
import { RecordRecentlyViewed } from "../../_components/record-recently-viewed";
import { deleteSubcontractorAction } from "./actions";

interface SubcontractorSiteContract {
  id: string;
  workCategory: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  site: { id: string; name: string };
  amountPayable: number | null;
  amountPaid: string;
  outstandingAmount: number | null;
}

const STATUS_BADGE: Record<SubcontractorSiteContract["status"], { variant: "neutral" | "success" | "danger"; label: string }> = {
  DRAFT: { variant: "neutral", label: "Draft" },
  ACTIVE: { variant: "success", label: "Active" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "danger", label: "Cancelled" },
};

const siteContractColumns: DataTableColumn<SubcontractorSiteContract>[] = [
  { header: "Site", cell: (row) => <span className="font-semibold">{row.site.name}</span> },
  { header: "Work", cell: (row) => row.workCategory ?? <span className="text-ink-500">—</span> },
  {
    header: "Status",
    cell: (row) => {
      const badge = STATUS_BADGE[row.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  {
    header: "Payable",
    align: "right",
    cell: (row) =>
      row.amountPayable === null ? (
        <span className="italic text-ink-500">Pending terms</span>
      ) : (
        <span className="font-semibold text-gold-700 tabular-nums">₹{row.amountPayable.toLocaleString("en-IN")}</span>
      ),
  },
  {
    header: "Paid",
    align: "right",
    cell: (row) => <span className="tabular-nums">₹{Number(row.amountPaid).toLocaleString("en-IN")}</span>,
  },
  {
    header: "Outstanding",
    align: "right",
    cell: (row) =>
      row.outstandingAmount === null ? (
        <span className="text-ink-500">—</span>
      ) : row.outstandingAmount < 0 ? (
        <span className="font-semibold text-success-700 tabular-nums">
          Advance ₹{Math.abs(row.outstandingAmount).toLocaleString("en-IN")}
        </span>
      ) : (
        <span className="font-semibold text-gold-700 tabular-nums">
          ₹{row.outstandingAmount.toLocaleString("en-IN")}
        </span>
      ),
  },
];

async function getSubcontractor(id: string): Promise<Subcontractor | null> {
  const res = await authedFetch(`/subcontractors/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractor (${res.status})`);
  }
  return res.json();
}

// FR-62: this Subcontractor's full cross-Site Site Contract history — same
// null-safe fault-isolation rule as Vendor's Purchase History section (a
// transient failure here degrades only this section, never the whole page).
async function getSiteContracts(id: string): Promise<SubcontractorSiteContract[] | null> {
  try {
    const res = await authedFetch(`/subcontractors/${id}/contracts`, { cache: "no-store" });
    if (!res.ok) return null;
    const rows = (await res.json()) as SubcontractorSiteContract[];
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

// The viewer's role, for gating the Delete affordance (the API enforces
// OWNER_ADMIN regardless). Least-privilege on failure.
async function getViewerRole(): Promise<string | null> {
  try {
    const res = await authedFetch(`/users/me`, { cache: "no-store" });
    if (!res.ok) return null;
    const me = (await res.json()) as { role?: string };
    return typeof me.role === "string" ? me.role : null;
  } catch {
    return null;
  }
}

export default async function SubcontractorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subcontractor = await getSubcontractor(id);

  if (!subcontractor) {
    notFound();
  }

  const [viewerRole, siteContracts] = await Promise.all([getViewerRole(), getSiteContracts(id)]);

  return (
    <>
      <RecordRecentlyViewed type="subcontractor" id={subcontractor.id} name={subcontractor.name} />

      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/subcontractors" className="hover:text-accent-teal-700 hover:underline">
          Subcontractors
        </Link>{" "}
        / {subcontractor.name}
      </div>

      <div className="mb-8 rounded-lg border border-border-hairline bg-surface-1 p-6 shadow-2">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-page-title text-ink-900">{subcontractor.name}</h1>
          <div className="action-button-row">
            <Link href={`/subcontractors/${subcontractor.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
              <PencilIcon className="size-4" />
              Edit
            </Link>
            {viewerRole === "OWNER_ADMIN" ? (
              <DeleteEntityButton
                label="Delete Subcontractor"
                title={`Delete ${subcontractor.name}?`}
                description="This Subcontractor will disappear from every list and picker. Their Site Contract, work, and payment history stays in the database and is not destroyed."
                action={deleteSubcontractorAction.bind(null, subcontractor.id)}
              />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Contact person</div>
            <div className="text-body-sm text-ink-900">{subcontractor.contactPerson ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Phone</div>
            <div className="text-body-sm text-ink-900">{subcontractor.phone ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Email</div>
            <div className="text-body-sm text-ink-900">{subcontractor.email ?? "—"}</div>
          </div>
          <div>
            <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Address</div>
            <div className="text-body-sm text-ink-900">{subcontractor.address ?? "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1 text-eyebrow uppercase text-ink-500">Work categories</div>
            {subcontractor.workCategories.length === 0 ? (
              <span className="text-body-sm text-ink-500">—</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {subcontractor.workCategories.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 text-section-header text-ink-900">Site Contracts</div>
      <DataTable
        columns={siteContractColumns}
        rowKey={(row) => row.id}
        rowHref={(row) => `/sites/${row.site.id}/contracts/${row.id}`}
        state={
          siteContracts === null
            ? { status: "empty", icon: <ClipboardIcon />, message: "Couldn't load this Subcontractor's Site Contracts right now." }
            : siteContracts.length === 0
              ? { status: "empty", icon: <ClipboardIcon />, message: "No Site Contracts recorded yet for this Subcontractor." }
              : { status: "success", rows: siteContracts }
        }
      />
    </>
  );
}
