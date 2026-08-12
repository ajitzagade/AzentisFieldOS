import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SitesPage from "./page";

// SitesPage is an async Server Component — calling it directly and
// rendering the resolved element tree is the standard way to test one
// with Vitest/RTL outside a full Next.js request harness.
async function renderSitesPage() {
  const element = await SitesPage();
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

describe("SitesPage", () => {
  it("renders every Site with its status badge, newest first as returned by the API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "1", name: "NH-48 Highway Widening", location: "Nashik", status: "ACTIVE", contractReference: "REF-1" },
        { id: "2", name: "Riverside Bridge", location: "Nashik", status: "ON_HOLD", contractReference: null },
      ],
    }) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Riverside Bridge")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("On Hold")).toBeInTheDocument();
  });

  it("links each row to its Site detail route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "abc", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null },
      ],
    }) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByText("NH-48").closest("a")).toHaveAttribute("href", "/sites/abc");
  });

  it("renders the empty state with a create-first-Site action when there are zero Sites", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByText("No Sites yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create your first Site/ })).toHaveAttribute("href", "/sites/new");
  });

  it("renders the Add Site link in the page header", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "1", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null }],
    }) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByRole("link", { name: /Add Site/ })).toHaveAttribute("href", "/sites/new");
  });
});
