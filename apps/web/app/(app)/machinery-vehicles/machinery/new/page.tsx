import { authedFetch } from "@/lib/api";
import { NewMachineryForm } from "./new-machinery-form";

interface MachineryTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getMachineryTypes(): Promise<MachineryTypeOption[]> {
  const res = await authedFetch(`/machinery-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery Types (${res.status})`);
  }
  return res.json();
}

export default async function NewMachineryPage() {
  const machineryTypes = await getMachineryTypes();
  // Story 14.3 (AC #1): a disabled Machinery Type is hidden from the Type
  // picker on new Machinery — it stays valid for assets already assigned to it.
  const activeMachineryTypes = machineryTypes.filter((t) => t.isActive);

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Register Machine</h1>
      <NewMachineryForm machineryTypes={activeMachineryTypes} />
    </div>
  );
}
