import { authedFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import { MapPinIcon } from "@azentisfieldos/ui";
import type { SubcontractorOption } from "../site-contract-form";
import { SiteContractForm } from "../site-contract-form";
import { createSiteContractAction } from "./actions";
import { parseCreateSiteContractForm } from "./parse";

interface SiteSummary {
  id: string;
  name: string;
}

async function getSite(id: string): Promise<SiteSummary | null> {
  const res = await authedFetch(`/sites/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site (${res.status})`);
  }
  return res.json();
}

async function getSubcontractors(): Promise<SubcontractorOption[]> {
  const res = await authedFetch(`/subcontractors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractors (${res.status})`);
  }
  return res.json();
}

export default async function NewSiteContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site, subcontractors] = await Promise.all([getSite(id), getSubcontractors()]);

  if (!site) {
    notFound();
  }

  return (
    <div className="max-w-160">
      <h1 className="mb-1 text-page-title text-ink-900">Engage a Subcontractor</h1>
      <p className="mb-6 flex items-center gap-1.5 text-body-sm text-ink-500">
        <MapPinIcon className="size-4" />
        Site Contract for {site.name}
      </p>
      <SiteContractForm
        mode="new"
        siteId={site.id}
        subcontractors={subcontractors}
        action={createSiteContractAction}
        parse={parseCreateSiteContractForm}
      />
    </div>
  );
}
