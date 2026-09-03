import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { UserIcon } from "@azentisfieldos/ui";
import { SiteContractForm } from "@/app/(app)/sites/[id]/contracts/site-contract-form";
import { createSiteContractAction } from "@/app/(app)/sites/[id]/contracts/new/actions";

interface SubcontractorSummary {
  id: string;
  name: string;
}

interface SiteOption {
  id: string;
  name: string;
}

async function getSubcontractor(id: string): Promise<SubcontractorSummary | null> {
  const res = await authedFetch(`/subcontractors/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractor (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

export default async function NewSubcontractorSiteContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [subcontractor, sites] = await Promise.all([getSubcontractor(id), getSites()]);

  if (!subcontractor) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-1 text-page-title text-ink-900">Add Site Contract</h1>
      <p className="mb-6 flex items-center gap-1.5 text-body-sm text-ink-500">
        <UserIcon className="size-4" />
        Engaging {subcontractor.name} at a Site
      </p>
      <SiteContractForm
        mode="new"
        subcontractorId={subcontractor.id}
        subcontractors={[subcontractor]}
        sites={sites}
        action={createSiteContractAction}
      />
    </div>
  );
}
