import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { EditSubcontractorForm } from "./edit-subcontractor-form";
import type { Subcontractor } from "../../page";

async function getSubcontractor(id: string): Promise<Subcontractor | null> {
  const res = await authedFetch(`/subcontractors/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractor (${res.status})`);
  }
  return res.json();
}

export default async function EditSubcontractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subcontractor = await getSubcontractor(id);

  if (!subcontractor) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Edit Subcontractor</h1>
      <EditSubcontractorForm subcontractor={subcontractor} />
    </div>
  );
}
