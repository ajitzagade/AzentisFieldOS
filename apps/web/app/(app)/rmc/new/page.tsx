import { authedFetch } from "@/lib/api";
import { RmcForm } from "../rmc-form";

interface SiteOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getVendors(): Promise<VendorOption[]> {
  const res = await authedFetch(`/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

export default async function NewRmcEntryPage() {
  const [sites, vendors] = await Promise.all([getSites(), getVendors()]);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record RMC Delivery</h1>
      <RmcForm mode="new" sites={sites} vendors={vendors} />
    </div>
  );
}
