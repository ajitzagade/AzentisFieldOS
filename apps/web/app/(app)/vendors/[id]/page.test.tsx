import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import VendorDetailPage from "./page";

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
  const element = await VendorDetailPage({ params: Promise.resolve({ id }) });
  render(element);
}

const vendor = {
  id: "v1",
  name: "Shree Balaji Traders",
  contactPerson: "Vikram Shah",
  phone: "+91 98200 41267",
  email: "vikram.shah@shreebalaji.co.in",
  address: "Plot 14, MIDC Industrial Area, Nashik",
  materialsSupplied: ["Cement", "Steel", "Aggregates"],
};

function mockFetch(purchases: unknown[]) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/purchases")) {
      return { ok: true, json: async () => purchases } as Response;
    }
    return { ok: true, json: async () => vendor } as Response;
  }) as unknown as typeof fetch;
}

describe("VendorDetailPage", () => {
  it("renders the Vendor's profile fields and materials chips", async () => {
    mockFetch([]);

    await renderDetailPage("v1");

    expect(screen.getByRole("heading", { name: "Shree Balaji Traders" })).toBeInTheDocument();
    expect(screen.getByText("Vikram Shah")).toBeInTheDocument();
    expect(screen.getByText("+91 98200 41267")).toBeInTheDocument();
    expect(screen.getByText("vikram.shah@shreebalaji.co.in")).toBeInTheDocument();
    expect(screen.getByText("Cement")).toBeInTheDocument();
    expect(screen.getByText("Aggregates")).toBeInTheDocument();
  });

  it("renders an explicit empty state, not a blank table, for a Vendor with no Purchases", async () => {
    mockFetch([]);

    await renderDetailPage("v1");

    // Rendered once in the md+ table's empty panel and once in the
    // below-md mobile card's empty panel.
    expect(screen.getAllByText("No Purchases recorded yet for this Vendor.")).toHaveLength(2);
  });

  it("renders every Purchase with Material, Quantity, Amount, Invoice/Challan #, and Payment status", async () => {
    mockFetch([
      {
        id: "p1",
        quantity: "500",
        rate: "380",
        totalAmount: "190000",
        invoiceOrChallanNo: "INV-4521",
        paymentStatus: "PAID",
        purchasedAt: "2026-08-02T00:00:00Z",
        materialSize: { label: "OPC 53", material: { name: "Cement", unit: { name: "Bags" } } },
      },
    ]);

    await renderDetailPage("v1");

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Cement (OPC 53)")).toHaveLength(2);
    expect(screen.getAllByText("500 Bags")).toHaveLength(2);
    expect(screen.getAllByText("₹1,90,000")).toHaveLength(2);
    expect(screen.getAllByText("INV-4521")).toHaveLength(2);
    expect(screen.getAllByText("Paid")).toHaveLength(2);
  });

  it("renders an Edit Vendor link pointing to the edit route", async () => {
    mockFetch([]);

    await renderDetailPage("v1");

    expect(screen.getByRole("link", { name: /Edit Vendor/ })).toHaveAttribute("href", "/vendors/v1/edit");
  });

  it("calls notFound() for a Vendor ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});

// D7 (review 2026-09-02): a Supervisor's unpriced inward entry reaches this
// Khata via listByVendor — it must read as pending, never as a ₹0 amount
// with a blank payment badge.
describe("VendorDetailPage — unpriced (Pricing pending) purchase rows", () => {
  it("renders an unpriced row with a pending badge and an amount dash, never ₹0", async () => {
    mockFetch([
      {
        id: "p-unpriced",
        purchasedAt: "2026-09-01T00:00:00.000Z",
        quantity: "50",
        totalAmount: null,
        paymentStatus: null,
        invoiceOrChallanNo: null,
        materialSize: { label: "OPC 53 Grade", material: { name: "Cement", unit: { name: "Bags" } } },
      },
    ]);

    await renderDetailPage("v1");

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Pricing pending")).toHaveLength(2);
    expect(screen.queryByText("₹0")).not.toBeInTheDocument();
  });
});
