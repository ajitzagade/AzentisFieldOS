import { authedFetch } from "@/lib/api";
import { WasteDisposalForm, type EquipmentOption } from "../waste-disposal-form";

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

interface MachineryListItem {
  id: string;
  name: string;
  assetNumber?: string | null;
  type?: { name: string } | null;
}

interface VehicleListItem {
  id: string;
  number: string;
  type?: { name: string } | null;
}

async function getList<T>(path: string): Promise<T[]> {
  const res = await authedFetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

export default async function NewWasteDisposalPage({
  searchParams,
}: {
  searchParams?: Promise<{ siteId?: string }>;
} = {}) {
  const [sites, vendors, machinery, vehicles, { siteId } = {}] = await Promise.all([
    getList<SiteOption>(`/sites`),
    getList<VendorOption>(`/vendors`),
    getList<MachineryListItem>(`/machinery`),
    getList<VehicleListItem>(`/vehicles`),
    searchParams,
  ]);

  // One picker over both own registers — same "machinery:/vehicle:" value
  // convention as the DSR equipment picker.
  const equipment: EquipmentOption[] = [
    ...machinery.map((m) => ({
      value: `machinery:${m.id}`,
      label: m.name,
      description: [m.type?.name, m.assetNumber].filter(Boolean).join(" · ") || "Machinery",
    })),
    ...vehicles.map((v) => ({
      value: `vehicle:${v.id}`,
      label: v.number,
      description: v.type?.name ?? "Vehicle",
    })),
  ];

  // Site detail deep-links here with ?siteId= — only honored when it names
  // a real Site.
  const prefillSiteId = sites.some((s) => s.id === siteId) ? siteId : undefined;

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Waste Disposal</h1>
      <WasteDisposalForm
        mode="new"
        sites={sites}
        vendors={vendors}
        equipment={equipment}
        initial={prefillSiteId ? { siteId: prefillSiteId } : undefined}
      />
    </div>
  );
}
