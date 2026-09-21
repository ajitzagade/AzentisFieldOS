import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import { notFound } from "next/navigation";
import { LabourerDetailClient, type WeeklyPaymentLedgerRow } from "./_components/labourer-detail-client";
import type { AdvanceOption } from "./_components/weekly-payment-form-modal";
import type { SiteOption } from "../../_components/site-field";

interface LabourerDetail {
  id: string;
  name: string;
  category: string;
  defaultPerDayAmount: number | null;
  outstandingAdvanceBalance: number;
}

async function getLabourer(id: string): Promise<LabourerDetail | null> {
  const res = await authedFetch(`/daily-labourers/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Labourer (${res.status})`);
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

async function getAdvances(labourerId: string): Promise<AdvanceOption[]> {
  const res = await authedFetch(`/daily-labour-advances?labourerId=${labourerId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Advances (${res.status})`);
  }
  const rows = (await res.json()) as { id: string; amount: number; givenAt: string }[];
  return rows.map((r) => ({ id: r.id, amount: r.amount, givenAt: r.givenAt.slice(0, 10) }));
}

async function getLedger(labourerId: string): Promise<WeeklyPaymentLedgerRow[]> {
  const res = await authedFetch(`/daily-labour-weekly-payments?labourerId=${labourerId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Payment History (${res.status})`);
  }
  return res.json();
}

export default async function LabourerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const labourer = await getLabourer(id);
  if (!labourer) {
    notFound();
  }
  const [role, sites, advances, ledger] = await Promise.all([
    currentRole(),
    getSites(),
    getAdvances(id),
    getLedger(id),
  ]);

  return (
    <LabourerDetailClient
      role={role}
      labourerId={labourer.id}
      labourerName={labourer.name}
      category={labourer.category}
      defaultPerDayAmount={labourer.defaultPerDayAmount}
      outstandingBalance={labourer.outstandingAdvanceBalance}
      sites={sites}
      advances={advances}
      ledger={ledger}
    />
  );
}
