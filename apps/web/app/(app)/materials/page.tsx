import Link from "next/link";
import { Badge, DataTable, LayersIcon, PencilIcon, PlusIcon, buttonVariants, cn, type DataTableColumn } from "@azentisfieldos/ui";
import type { CustomFieldDefinition } from "@azentisfieldos/shared";

export interface MaterialListItem {
  id: string;
  name: string;
  isActive: boolean;
  category: { id: string; name: string };
  unit: { id: string; name: string };
  sizes: { id: string; label: string }[];
  // Normalized to a real array by apps/api (materials.service.ts) even for
  // Materials created before story 4.3 — never the raw Prisma `{}` default.
  customFields: CustomFieldDefinition[];
  lowStockThreshold: string | null;
}

async function getMaterials(): Promise<MaterialListItem[]> {
  const res = await fetch(`${process.env.API_URL}/materials`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Materials (${res.status})`);
  }
  return res.json();
}

function customFieldsCount(customFields: unknown): number {
  return Array.isArray(customFields) ? customFields.length : 0;
}

const columns: DataTableColumn<MaterialListItem>[] = [
  { header: "Category", cell: (m) => m.category.name },
  {
    header: "Material",
    cell: (m) => (
      <span className="flex items-center gap-2 font-semibold">
        {m.name}
        {!m.isActive ? <Badge variant="neutral">Disabled</Badge> : null}
      </span>
    ),
  },
  {
    header: "Sizes / Specifications",
    cell: (m) =>
      m.sizes.length === 0 ? (
        <span className="text-ink-500">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {m.sizes.map((size) => (
            <span key={size.id} className="rounded-full bg-surface-3 px-2 py-0.5 text-caption font-semibold text-ink-700">
              {size.label}
            </span>
          ))}
        </div>
      ),
  },
  { header: "Unit", cell: (m) => m.unit.name },
  { header: "Custom Fields", align: "right", cell: (m) => customFieldsCount(m.customFields) },
  {
    header: "",
    cell: (m) => (
      <Link href={`/materials/${m.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        <PencilIcon className="size-4" />
        Edit
      </Link>
    ),
  },
];

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-ink-900">Materials</h1>
          <p className="text-body-sm text-ink-500">Your material catalog — Categories, Materials, Sizes, and Units</p>
        </div>
        <div className="flex gap-2">
          <Link href="/materials/categories" className={cn(buttonVariants({ variant: "secondary" }))}>
            Categories
          </Link>
          <Link href="/materials/units" className={cn(buttonVariants({ variant: "secondary" }))}>
            Units
          </Link>
          <Link href="/materials/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            Add Material
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        rowKey={(m) => m.id}
        state={
          materials.length === 0
            ? {
                status: "empty",
                icon: <LayersIcon />,
                message: "No Materials yet.",
                action: (
                  <Link href="/materials/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Add your first Material
                  </Link>
                ),
              }
            : { status: "success", rows: materials }
        }
      />
    </>
  );
}
