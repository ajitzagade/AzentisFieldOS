import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LabourPaymentsPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

function mockLabourers(labourers: unknown[]) {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => labourers }) as unknown as typeof fetch;
}

describe("LabourPaymentsPage", () => {
  it("renders every Labourer with category, per-day amount, and outstanding advance", async () => {
    mockLabourers([
      { id: "l1", name: "Ramesh Kumar", category: "Mason", defaultPerDayAmount: 800, isActive: true, outstandingAdvanceBalance: 0 },
      { id: "l2", name: "Suresh Patil", category: "Helper", defaultPerDayAmount: null, isActive: true, outstandingAdvanceBalance: 500 },
    ]);

    const element = await LabourPaymentsPage();
    render(element);

    // DataTable's mobileCard mode renders both a desktop and mobile copy of
    // every row simultaneously (one CSS-hidden) — assert via getAllByText,
    // not a plain single-match query (AGENTS.md's own documented gotcha).
    expect(screen.getAllByText("Ramesh Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mason").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹800").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Suresh Patil").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Ramesh Kumar/ })[0]).toHaveAttribute("href", "/labour-payments/l1");
  });

  it("shows a clear empty state with an Add Labourer action when there are none yet", async () => {
    mockLabourers([]);

    const element = await LabourPaymentsPage();
    render(element);

    expect(screen.getAllByText("No Labourers added yet.").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Add your first Labourer/ })[0]).toHaveAttribute("href", "/labour-payments/new");
  });
});
