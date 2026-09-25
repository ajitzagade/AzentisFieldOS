import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { EditLabourerForm } from "./edit-labourer-form";

export interface EditableLabourer {
  id: string;
  name: string;
  category: string;
  defaultPerDayAmount: number | null;
}

async function getLabourer(id: string): Promise<EditableLabourer | null> {
  const res = await authedFetch(`/daily-labourers/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Labourer (${res.status})`);
  }
  return res.json();
}

export default async function EditLabourerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const labourer = await getLabourer(id);

  if (!labourer) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Labourer</h1>
      <EditLabourerForm labourer={labourer} />
    </div>
  );
}
