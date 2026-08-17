import { notFound } from "next/navigation";
import { EditMachineryForm } from "./edit-machinery-form";

// currentStatus/currentSiteId are read-only derived state (Story 8.2's
// movement log) — present here for display on the detail page shell, but
// never editable via this form (AC #3).
export interface MachineryDetail {
  id: string;
  name: string;
  assetNumber: string;
  model: string | null;
  ownership: string | null;
  operator: string | null;
  currentStatus: "AVAILABLE" | "AT_SITE" | "MAINTENANCE";
  type: { id: string; name: string };
  currentSite: { id: string; name: string } | null;
}

interface MachineryTypeOption {
  id: string;
  name: string;
}

async function getMachinery(id: string): Promise<MachineryDetail | null> {
  const res = await fetch(`${process.env.API_URL}/machinery/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Machinery (${res.status})`);
  }
  return res.json();
}

async function getMachineryTypes(): Promise<MachineryTypeOption[]> {
  const res = await fetch(`${process.env.API_URL}/machinery-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery Types (${res.status})`);
  }
  return res.json();
}

export default async function EditMachineryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machinery, machineryTypes] = await Promise.all([getMachinery(id), getMachineryTypes()]);

  if (!machinery) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Machine</h1>
      <EditMachineryForm machinery={machinery} machineryTypes={machineryTypes} />
    </div>
  );
}
