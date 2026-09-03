import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import NewSubcontractorSiteContractPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

const SUBCONTRACTOR = { id: "sc1", name: "Ganesh Pipeline Works" };
const SITES = [
  { id: "site-1", name: "NH-48 Extension" },
  { id: "site-2", name: "Riverside Godown" },
];

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

function mockPage(overrides: { subcontractor?: unknown; subcontractorStatus?: number; sites?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => overrides.sites ?? SITES });
    }
    const status = overrides.subcontractorStatus ?? (overrides.subcontractor === null ? 404 : 200);
    return Promise.resolve({
      ok: status < 400,
      status,
      json: async () => overrides.subcontractor ?? SUBCONTRACTOR,
    });
  }) as unknown as typeof fetch;
}

async function renderPage(id: string) {
  const element = await NewSubcontractorSiteContractPage({ params: Promise.resolve({ id }) });
  render(element);
}

describe("NewSubcontractorSiteContractPage", () => {
  it("calls notFound() for a Subcontractor that doesn't exist", async () => {
    mockPage({ subcontractor: null, subcontractorStatus: 404 });

    await expect(renderPage("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders the form with the Subcontractor fixed/disabled and a required, enabled Site picker", async () => {
    mockPage({});

    await renderPage("sc1");

    expect(screen.getByText(/Ganesh Pipeline Works/)).toBeInTheDocument();

    const subcontractorField = screen.getByLabelText("Subcontractor");
    expect(subcontractorField).toBeDisabled();
    expect(subcontractorField).toHaveValue("Ganesh Pipeline Works");

    const siteField = screen.getByLabelText("Site");
    expect(siteField).not.toBeDisabled();
    expect(siteField).toBeRequired();
  });
});
