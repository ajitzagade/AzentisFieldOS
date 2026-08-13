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
    photos: [{ id: "p-1", url: "https://r2.example/p1.jpg", createdAt: "2026-08-11T10:00:00Z" }],
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
    expect(screen.getByText("Photos (1)")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);
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
          photos: [],
        }),
    }) as unknown as typeof fetch;

    await renderDetailPage("dsr-1");

    expect(screen.getByText("No crew recorded for this report.")).toBeInTheDocument();
    expect(screen.getByText("No materials logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No RMC delivery logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No machinery or vehicles tagged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No expenses logged for this report.")).toBeInTheDocument();
    expect(screen.getByText("No photos attached to this report.")).toBeInTheDocument();
  });

  it("calls notFound() for a report ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
