import { NewMachineryForm } from "./new-machinery-form";

interface MachineryTypeOption {
  id: string;
  name: string;
}

async function getMachineryTypes(): Promise<MachineryTypeOption[]> {
  const res = await fetch(`${process.env.API_URL}/machinery-types`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Machinery Types (${res.status})`);
  }
  return res.json();
}

export default async function NewMachineryPage() {
  const machineryTypes = await getMachineryTypes();

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Register Machine</h1>
      <NewMachineryForm machineryTypes={machineryTypes} />
    </div>
  );
}
