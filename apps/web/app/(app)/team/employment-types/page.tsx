import Link from "next/link";
import { Badge, DataTable, UsersIcon, type DataTableColumn } from "@azentisfieldos/ui";
import { AddEmploymentTypeForm } from "./add-employment-type-form";

interface EmploymentTypeItem {
  id: string;
  name: string;
  isActive: boolean;
}

async function getEmploymentTypes(): Promise<EmploymentTypeItem[]> {
  const res = await fetch(`${process.env.API_URL}/employment-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Employment Types (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<EmploymentTypeItem>[] = [
  {
    header: "Name",
    cell: (e) => (
      <span className="flex items-center gap-2 font-semibold">
        {e.name}
        {!e.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
];

// Minimal create+list — Epic 14 owns the full admin lifecycle (edit,
// disable) per Story 6.1's own AC #3 scope, same split Epic 4 used for Unit.
export default async function EmploymentTypesPage() {
  const employmentTypes = await getEmploymentTypes();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/team" className="hover:text-accent-teal-700 hover:underline">
          Team &amp; Labour
        </Link>{" "}
        / Employment Types
      </div>
      <h1 className="mb-6 text-page-title text-ink-900">Employment Types</h1>

      <div className="mb-6 max-w-160">
        <AddEmploymentTypeForm />
      </div>

      <DataTable
        columns={columns}
        rowKey={(e) => e.id}
        state={
          employmentTypes.length === 0
            ? { status: "empty", icon: <UsersIcon />, message: "No Employment Types yet." }
            : { status: "success", rows: employmentTypes }
        }
      />
    </>
  );
}
