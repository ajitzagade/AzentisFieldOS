import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import DsrDetailPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderDetailPage(id: string) {
  const element = await DsrDetailPage({ params: Promise.resolve({ id }) });
  return render(element);
}

function fullDsr(overrides: Record<string, unknown> = {}) {
  return {
    id: "dsr-1",
    site: { id: "site-1", name: "NH-48 Highway Widening" },
    submittedBy: { name: "Ramesh Yadav" },
    reportDate: "2026-08-11",
    workCompleted: "RCC pour completed at Ch. 44+200",
    workInProgress: null,
    plannedWork: null,
    issuesBlockers: "One crew member absent",
    safetyObservations: null,
    notes: null,
    equipmentUsed: [{ type: "MACHINERY", id: "mach-1", name: "JCB 3DX" }],
    workRecords: [
      { id: "wr-1", teamMember: { name: "Suresh Patil" }, attended: true, hours: 8, overtimeHours: null },
      { id: "wr-2", teamMember: { name: "Ravi Kumar" }, attended: false, hours: null, overtimeHours: null },
    ],
    consumptions: [
      { id: "c-1", materialSize: { label: "50kg", material: { name: "Cement" } }, quantity: 40, activityReference: null },
    ],
    rmcEntries: [{ id: "r-1", vendor: { name: "ABC Suppliers" }, quantityM3: 12, grade: "M25", totalAmount: 72000 }],
    expenses: [{ id: "e-1", category: { name: "Fuel" }, amount: 4200, description: "Diesel refill" }],
    // Client-readiness batch (2026-09-20), goal 3.
    wasteDisposalEntries: [
      { id: "w-1", wasteType: "Debris", ownership: "OWN", tripCount: 2, vendor: null, totalAmount: null },
    ],
    photos: [{ id: "p-1", url: "https://r2.example/p1.jpg", createdAt: "2026-08-11T10:00:00Z" }],
    // Client-readiness batch (2026-09-20), goal 2.
    otherActivity: [],
    // Inventory→DSR sync fix (2026-09-21).
    materialsReceived: [],
    standaloneConsumptions: [],
    standaloneRmcEntries: [],
    standaloneWasteDisposals: [],
    standaloneWastageReturns: [],
    standaloneExpenses: [],
    standaloneWorkEntries: [],
    ...overrides,
  };
}

describe("DsrDetailPage", () => {
  it("renders the full report detail — work, crew, materials, RMC, equipment, expenses, and photos (AC #2)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => fullDsr() }) as unknown as typeof fetch;

    const { container } = await renderDetailPage("dsr-1");

    expect(screen.getByRole("heading", { name: /NH-48 Highway Widening/ })).toBeInTheDocument();
    expect(screen.getByText("Submitted by Ramesh Yadav")).toBeInTheDocument();
    expect(screen.getByText("RCC pour completed at Ch. 44+200")).toBeInTheDocument();
    expect(screen.getByText("One crew member absent")).toBeInTheDocument();
    expect(screen.getByText("Crew (1 of 2 present)")).toBeInTheDocument();
    expect(screen.getByText("Suresh Patil")).toBeInTheDocument();
    expect(screen.getByText("Cement (50kg)")).toBeInTheDocument();
    expect(screen.getByText(/ABC Suppliers/)).toBeInTheDocument();
    expect(screen.getByText("JCB 3DX")).toBeInTheDocument();
    expect(screen.getByText("Diesel refill")).toBeInTheDocument();
    expect(screen.getByText("₹4,200")).toBeInTheDocument();
    expect(screen.getByText(/Debris — 2 trips/)).toBeInTheDocument();
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("No other activity recorded for this Site on this date.")).toBeInTheDocument();
  });

  // Review fix (finding #9): a Waste Material correction-delta row can
  // carry a negative totalAmount — must render sign-first ("−₹2,000"), not
  // "₹-2,000".
  it("renders a negative Waste Material totalAmount sign-first", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        fullDsr({
          wasteDisposalEntries: [
            { id: "w-2", wasteType: "Debris", ownership: "OWN", tripCount: -2, vendor: null, totalAmount: -2000 },
          ],
        }),
    }) as unknown as typeof fetch;

    await renderDetailPage("dsr-1");

    expect(screen.getByText("−₹2,000")).toBeInTheDocument();
    expect(screen.queryByText("₹-2,000")).not.toBeInTheDocument();
  });

  it("renders honest empty-state text for each section instead of a blank list when a report has no data for it", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        fullDsr({
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          equipmentUsed: [],
          expenses: [],
          wasteDisposalEntries: [],
          photos: [],
        }),
    }) as unknown as typeof fetch;

    await renderDetailPage("dsr-1");

    expect(screen.getByText("No crew recorded for this report.")).toBeInTheDocument();
    expect(screen.getByText("No materials logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No RMC delivery logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No machinery or vehicles tagged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No expenses logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No Waste Material logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No photos attached to this report.")).toBeInTheDocument();
    expect(screen.getByText("No materials received logged for this Site on this date.")).toBeInTheDocument();
    expect(screen.getByText("No material wastage or returns logged for this Site on this date.")).toBeInTheDocument();
  });

  // Inventory→DSR sync fix (2026-09-21): a Purchase/Movement/standalone
  // Consumption/RMC/Waste/Wastage-Return recorded outside this DSR's own
  // form must show up in this report's own sections, not a generic list.
  it("merges Materials Received and standalone material activity into their own sections", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        fullDsr({
          materialsReceived: [
            {
              id: "mr-1",
              occurredAt: "2026-08-11T08:00:00Z",
              materialName: "Steel",
              sizeLabel: "12mm",
              unitName: "Kg",
              quantity: 200,
              amount: 14000,
              summary: "from Shree Balaji Traders",
              source: "PURCHASE",
              pending: false,
            },
            {
              id: "mr-2",
              occurredAt: "2026-08-11T08:00:00Z",
              materialName: "Gravel",
              sizeLabel: "20mm",
              unitName: "m3",
              quantity: 12,
              amount: null,
              summary: "Godown → Site",
              source: "MOVEMENT",
              pending: true,
            },
          ],
          standaloneConsumptions: [
            {
              id: "sc-1",
              occurredAt: "2026-08-11T09:00:00Z",
              materialName: "Sand",
              sizeLabel: "River sand",
              unitName: "m3",
              quantity: 5,
              amount: null,
              summary: "consumed on site",
            },
          ],
          standaloneWastageReturns: [
            {
              id: "sw-1",
              occurredAt: "2026-08-11T11:00:00Z",
              materialName: "Bricks",
              sizeLabel: "Standard",
              unitName: "Nos",
              quantity: 50,
              amount: null,
              summary: "wastage",
              kind: "WASTAGE",
            },
          ],
          standaloneExpenses: [
            {
              id: "se-1",
              occurredAt: "2026-08-11T12:00:00Z",
              categoryName: "Transport",
              description: "Site visit taxi",
              amount: 350,
            },
          ],
          standaloneWorkEntries: [
            {
              id: "swe-1",
              occurredAt: "2026-08-11T13:00:00Z",
              subcontractorName: "Balaji Shuttering Works",
              quantity: 25,
              note: "Shuttering — 3rd floor",
            },
          ],
        }),
    }) as unknown as typeof fetch;

    await renderDetailPage("dsr-1");

    expect(screen.getByText(/Steel \(12mm\)/)).toBeInTheDocument();
    expect(screen.getByText(/from Shree Balaji Traders/)).toBeInTheDocument();
    expect(screen.getByText(/Sand \(River sand\)/)).toBeInTheDocument();
    expect(screen.getByText("via Material Used")).toBeInTheDocument();
    expect(screen.getByText(/Bricks \(Standard\)/)).toBeInTheDocument();
    expect(screen.getByText("Wastage")).toBeInTheDocument();
    // Regression (2026-09-22): a Movement not yet confirmed at the
    // destination Site must say so — its quantity is the sent amount, not
    // yet the verified received amount, and can still change.
    expect(screen.getByText(/Gravel \(20mm\)/)).toBeInTheDocument();
    expect(screen.getByText("Pending confirmation")).toBeInTheDocument();
    // Auto-sync Expenses (2026-09-22): a standalone Expense (the /expenses
    // module, not this DSR's own form) merges into the same section and
    // total — the user never has to re-enter it here.
    expect(screen.getByText(/Site visit taxi/)).toBeInTheDocument();
    expect(screen.getByText("via Expense")).toBeInTheDocument();
    // DSR-form expense (4200) + standalone (350) = 4550.
    expect(screen.getByText(/4,550/)).toBeInTheDocument();
    // Inventory→DSR sync fix, extended (2026-09-22): a Work Entry recorded
    // directly on the Site Contract page (not through this DSR form) merges
    // into "Subcontractors on site" the same way every other standalone
    // activity type already does.
    expect(screen.getByText(/Balaji Shuttering Works/)).toBeInTheDocument();
    expect(screen.getByText(/Shuttering — 3rd floor/)).toBeInTheDocument();
    expect(screen.getByText("via Site Contract")).toBeInTheDocument();
  });

  it("calls notFound() for a report ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
