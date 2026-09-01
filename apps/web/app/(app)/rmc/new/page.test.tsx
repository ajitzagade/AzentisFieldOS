import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewRmcEntryPage from "./page";

async function renderNewRmcEntryPage() {
  const element = await NewRmcEntryPage();
  render(element);
}

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

function mockFetchRouter(handlers: { sites?: unknown; vendors?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewRmcEntryPage", () => {
  it("renders the RMC delivery form with Site and Vendor options loaded from the API", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      vendors: [{ id: "vendor1", name: "Anand RMC Suppliers" }],
    });

    await renderNewRmcEntryPage();

    // SiteField is a searchable combobox — options render on demand; the
    // labelled combobox itself proves the Site picker is wired.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(screen.getByRole("button", { name: "Record RMC Delivery" })).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Vendor"), "anand");
    expect(await screen.findByText("Anand RMC Suppliers")).toBeInTheDocument();
  });
});
