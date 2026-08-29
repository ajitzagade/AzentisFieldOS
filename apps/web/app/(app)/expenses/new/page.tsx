import { authedFetch } from "@/lib/api";
import { ExpenseForm } from "../expense-form";

interface SiteOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
  isActive: boolean;
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

async function getCategories(): Promise<CategoryOption[]> {
  const res = await authedFetch(`/expense-categories`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Expense Categories (${res.status})`);
  }
  return res.json();
}

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams?: Promise<{ siteId?: string }>;
} = {}) {
  const [sites, categories, { siteId } = {}] = await Promise.all([getSites(), getCategories(), searchParams]);
  // Story 14.3 (AC #1): a disabled Expense Category is hidden from the picker
  // on new Expenses — it stays valid for Expenses already recorded against it.
  const activeCategories = categories.filter((c) => c.isActive);
  // Site detail deep-links here with ?siteId= so the Site arrives
  // pre-selected — only honored when it names a real Site.
  const prefillSiteId = sites.some((s) => s.id === siteId) ? siteId : undefined;

  return (
    <div className="max-w-160">
      <h1 className="mb-6 text-page-title text-ink-900">Record Expense</h1>
      <ExpenseForm mode="new" sites={sites} categories={activeCategories} initial={prefillSiteId ? { siteId: prefillSiteId } : undefined} />
    </div>
  );
}
