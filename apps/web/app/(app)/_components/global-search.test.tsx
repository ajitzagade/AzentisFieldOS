import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, Toaster } from "@azentisfieldos/ui";

const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock, refresh: refreshMock }) }));

const createAdvanceQuickActionMock = vi.fn();
vi.mock("@/app/(app)/team/[id]/advances/actions", () => ({
  createAdvanceQuickAction: (...args: unknown[]) => createAdvanceQuickActionMock(...args),
}));

import { GlobalSearchButton, GlobalSearchDialog, useGlobalSearchController } from "./global-search";

function Harness({ role = "OWNER_ADMIN" }: { role?: "OWNER_ADMIN" | "SITE_SUPERVISOR" } = {}) {
  const search = useGlobalSearchController(role);
  return (
    <ToastProvider>
      <GlobalSearchButton onClick={() => search.setOpen(true)} />
      <GlobalSearchDialog controller={search} />
      <Toaster />
    </ToastProvider>
  );
}

const EMPTY_GROUP = { results: [], total: 0 };

const RESPONSE = {
  sites: {
    results: [{ id: "s1", name: "Nashik Metro", location: "Nashik", contractReference: null }],
    total: 1,
  },
  materials: {
    results: [{ id: "m1", name: "Cement", category: { id: "c1", name: "Binders" } }],
    total: 1,
  },
  vendors: {
    results: [{ id: "v1", name: "Universal Vendors Pvt Ltd", contactPerson: "Ramesh", phone: "9876543210" }],
    total: 1,
  },
  teamMembers: {
    results: [{ id: "tm1", name: "Ravi Kumar", designation: "Mason" }],
    total: 1,
  },
  payments: {
    // A distinct name from the Team Member fixture below — both render a
    // plain-text label, and duplicate exact text across groups would make
    // findByText ambiguous.
    results: [{ id: "pay1", teamMemberName: "Sanjay Pawar", payPeriod: "1-15 Aug 2026", netPayable: 16500 }],
    total: 1,
  },
  purchases: {
    results: [
      { id: "pur-pending", vendorName: "Shree Traders", materialName: "Cement", totalAmount: null },
      { id: "pur-priced", vendorName: "Shree Traders", materialName: "Cement", totalAmount: 50000 },
    ],
    total: 2,
  },
  subcontractors: {
    results: [{ id: "sub1", name: "Balaji Contractors", contactPerson: "Suresh", phone: "9123456780" }],
    total: 1,
  },
  rmc: {
    results: [{ id: "rmc1", grade: "M25", siteName: "Nashik Metro", vendorName: "ABC RMC" }],
    total: 1,
  },
  expenses: {
    // A distinct Site name from the Sites fixture above — the Expense's
    // description caption renders siteName as its own text node, and
    // duplicate exact text across groups would make findByText ambiguous.
    results: [{ id: "exp1", description: "Diesel", siteName: "Pune Extension", amount: 2000 }],
    total: 1,
  },
};

const ALL_EMPTY = {
  sites: EMPTY_GROUP,
  materials: EMPTY_GROUP,
  vendors: EMPTY_GROUP,
  teamMembers: EMPTY_GROUP,
  payments: EMPTY_GROUP,
  purchases: EMPTY_GROUP,
  subcontractors: EMPTY_GROUP,
  rmc: EMPTY_GROUP,
  expenses: EMPTY_GROUP,
};

const originalFetch = global.fetch;

function mockFetch(searchResponse: unknown, teamMembersResponse?: unknown) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/team-members")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => teamMembersResponse ?? [{ id: "tm1", name: "Ravi Kumar" }],
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => searchResponse });
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

beforeEach(() => {
  pushMock.mockClear();
  refreshMock.mockClear();
  createAdvanceQuickActionMock.mockReset();
});

afterEach(() => {
  global.fetch = originalFetch;
});

async function openAndSearch(query: string) {
  fireEvent.click(screen.getByRole("button", { name: /search/i }));
  fireEvent.change(await screen.findByRole("textbox"), { target: { value: query } });
}

describe("GlobalSearch", () => {
  it("opens the palette via the Cmd/Ctrl+K keyboard shortcut", async () => {
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("opens via the visible button and debounces the fetch while typing", async () => {
    const fetchMock = mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("nashik");

    expect(fetchMock).not.toHaveBeenCalled();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 1000 });
    const calledUrl = fetchMock.mock.calls[0]![0] as string;
    expect(calledUrl).toContain("/search?q=nashik");
  });

  it("navigates to the Site detail page and closes when a Site result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("nashik");

    fireEvent.click(await screen.findByText("Nashik Metro", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/sites/s1");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("navigates to the Material's cross-Site availability page when a Material result is selected (Story 16.3)", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("cement");

    fireEvent.click(await screen.findByText("Cement", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/materials/m1/availability");
  });

  it('navigates to the filtered Sites list when "See all" is chosen, carrying the query', async () => {
    const manySites = {
      ...ALL_EMPTY,
      sites: {
        results: [{ id: "s1", name: "Nashik Metro", location: "Nashik", contractReference: null }],
        total: 12,
      },
    };
    mockFetch(manySites);
    render(<Harness />);

    await openAndSearch("nashik");

    fireEvent.click(
      await screen.findByRole("button", { name: /see all 12 results/i }, { timeout: 1000 }),
    );

    expect(pushMock).toHaveBeenCalledWith("/sites?q=nashik");
  });

  // ---- Story 19.2: the 7 new entity groups ----

  it("navigates to the Vendor detail page when a Vendor result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("universal");

    fireEvent.click(await screen.findByText("Universal Vendors Pvt Ltd", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/vendors/v1");
  });

  it("navigates to the Team Member detail page when a Team Member result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("ravi");

    fireEvent.click(await screen.findByText("Ravi Kumar", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/team/tm1");
  });

  it("navigates to the Subcontractor detail page when a Subcontractor result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("balaji");

    fireEvent.click(await screen.findByText("Balaji Contractors", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/subcontractors/sub1");
  });

  it("navigates to the Payment's correct page when a Payment result is selected (no Payment detail page exists)", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("1-15 aug");

    fireEvent.click(await screen.findByText("Sanjay Pawar", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/payments/pay1/correct");
  });

  it("navigates to the RMC entry's correct page when an RMC result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("m25");

    fireEvent.click(await screen.findByText("M25 — Nashik Metro", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/rmc/rmc1/correct");
  });

  it("navigates to the Expense's correct page when an Expense result is selected", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("diesel");

    fireEvent.click(await screen.findByText("Diesel", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/expenses/exp1/correct");
  });

  it("routes an unpriced Purchase (totalAmount null) to the pricing screen, not correct", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("cement");

    const rows = await screen.findAllByText("Cement — Shree Traders", {}, { timeout: 1000 });
    fireEvent.click(rows[0]!);

    expect(pushMock).toHaveBeenCalledWith("/movements/purchases/pur-pending/pricing");
  });

  it("routes an already-priced Purchase to the correct screen, not pricing", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("cement");

    const rows = await screen.findAllByText("Cement — Shree Traders", {}, { timeout: 1000 });
    fireEvent.click(rows[1]!);

    expect(pushMock).toHaveBeenCalledWith("/movements/purchases/pur-priced/correct");
  });

  it('navigates to the Movements log filtered to Purchases when Purchases\' "See all" is chosen', async () => {
    const manyPurchases = {
      ...ALL_EMPTY,
      purchases: {
        results: [{ id: "pur-pending", vendorName: "Shree Traders", materialName: "Cement", totalAmount: null }],
        total: 12,
      },
    };
    mockFetch(manyPurchases);
    render(<Harness />);

    await openAndSearch("cement");

    fireEvent.click(
      await screen.findByRole("button", { name: /see all 12 results/i }, { timeout: 1000 }),
    );

    expect(pushMock).toHaveBeenCalledWith("/movements?type=PURCHASE&q=cement");
  });

  it('navigates to the filtered Vendors list when Vendors\' "See all" is chosen', async () => {
    const manyVendors = {
      ...ALL_EMPTY,
      vendors: {
        results: [{ id: "v1", name: "Universal Vendors Pvt Ltd", contactPerson: null, phone: null }],
        total: 8,
      },
    };
    mockFetch(manyVendors);
    render(<Harness />);

    await openAndSearch("universal");

    fireEvent.click(
      await screen.findByRole("button", { name: /see all 8 results/i }, { timeout: 1000 }),
    );

    expect(pushMock).toHaveBeenCalledWith("/vendors?q=universal");
  });

  // ---- Story 19.2: curated Actions ----

  it('shows "Add Vendor" in an Actions group above the matching Vendor entity group, for a query matching both', async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("vendor");

    const actionsLabel = await screen.findByText("Actions", {}, { timeout: 1000 });
    const vendorsLabel = await screen.findByText("Vendors");
    // Actions must appear above the Vendors group in the DOM (AC #2).
    expect(actionsLabel.compareDocumentPosition(vendorsLabel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Add Vendor")).toBeInTheDocument();
  });

  it('matches "Record Payment" and navigates to /payments/new without opening the Advance modal', async () => {
    mockFetch(ALL_EMPTY);
    render(<Harness />);

    await openAndSearch("record payment");

    fireEvent.click(await screen.findByText("Record Payment", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/payments/new");
    expect(createAdvanceQuickActionMock).not.toHaveBeenCalled();
  });

  it('matches "pricing" to the Review & Price action, routing to the Movements pending-pricing tab (Story 19.5)', async () => {
    mockFetch(ALL_EMPTY);
    render(<Harness />);

    await openAndSearch("pricing");

    fireEvent.click(await screen.findByText("Review & Price", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/movements?type=PURCHASE_PENDING_PRICING");
  });

  it("hides owner-only curated Actions (Record Payment/Advance, Review & Price, Add Subcontractor, Open Settings) for SITE_SUPERVISOR", async () => {
    mockFetch(ALL_EMPTY);
    render(<Harness role="SITE_SUPERVISOR" />);

    await openAndSearch("record");

    expect(screen.queryByText("Record Payment")).not.toBeInTheDocument();
    expect(screen.queryByText("Record Advance")).not.toBeInTheDocument();
  });

  it("still shows Supervisor-legitimate curated Actions (Add Purchase) for SITE_SUPERVISOR", async () => {
    mockFetch(ALL_EMPTY);
    render(<Harness role="SITE_SUPERVISOR" />);

    await openAndSearch("add purchase");

    expect(await screen.findByText("Add Purchase")).toBeInTheDocument();
  });

  it('selecting "Record Advance" opens the quick-entry modal in place — no navigation', async () => {
    mockFetch(ALL_EMPTY);
    render(<Harness />);

    await openAndSearch("add advance");

    fireEvent.click(await screen.findByText("Record Advance", {}, { timeout: 1000 }));

    // The search palette closes and the Advance modal opens in its place.
    expect(await screen.findByRole("dialog", { name: "Record Advance" })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("never renders a curated Action for a query that matches no title/keyword", async () => {
    mockFetch(RESPONSE);
    render(<Harness />);

    await openAndSearch("nashik");

    await screen.findByText("Nashik Metro", {}, { timeout: 1000 });
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });
});
