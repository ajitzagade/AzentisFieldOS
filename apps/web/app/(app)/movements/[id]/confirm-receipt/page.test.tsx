import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import ConfirmReceiptPage from "./page";

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

async function renderConfirmReceiptPage(id: string) {
  const element = await ConfirmReceiptPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("ConfirmReceiptPage", () => {
  it("shows the sent quantity and destination for a pending Movement", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "m1",
        sentQuantity: "1300",
        receivedQuantity: null,
        destinationSite: { name: "NH-48 Highway Widening" },
        materialSize: { label: "12mm", material: { name: "TMT Steel", unit: { name: "Kg" } } },
      }),
    }) as unknown as typeof fetch;

    await renderConfirmReceiptPage("m1");

    expect(screen.getByText(/TMT Steel \(12mm\) arriving at NH-48 Highway Widening/)).toBeInTheDocument();
    expect(screen.getByText(/Sent: 1300 Kg/)).toBeInTheDocument();
  });

  it("calls notFound() for a Movement id that does not exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderConfirmReceiptPage("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() for a Movement whose receipt is already confirmed (no double-confirm route)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "m1",
        sentQuantity: "1300",
        receivedQuantity: "1300",
        destinationSite: { name: "NH-48 Highway Widening" },
        materialSize: { label: "12mm", material: { name: "TMT Steel", unit: { name: "Kg" } } },
      }),
    }) as unknown as typeof fetch;

    await expect(renderConfirmReceiptPage("m1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
