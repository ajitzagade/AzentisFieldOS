import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SupervisorHome } from "./supervisor-home";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch({
  today = { sitesReportingToday: 0, sitesMissingDsrToday: [] },
  drafts = [],
}: {
  today?: { sitesReportingToday: number; sitesMissingDsrToday: { siteId: string; name: string }[] };
  drafts?: { id: string; reportDate: string; updatedAt: string; site: { id: string; name: string } }[];
} = {}) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/dashboard/today")) {
      return { ok: true, json: async () => today } as Response;
    }
    if (url.includes("/dsr/drafts")) {
      return { ok: true, json: async () => drafts } as Response;
    }
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderHome() {
  const element = await SupervisorHome();
  return render(element);
}

// "My Drafts" quick-resume (2026-09-21, deferred-work.md).
describe("SupervisorHome — My Drafts quick-resume", () => {
  it("shows the plain 'Start Daily Report' hero when there are no open drafts", async () => {
    mockFetch({ drafts: [] });

    await renderHome();

    expect(screen.getByText("Start Daily Report")).toBeInTheDocument();
    expect(screen.queryByText(/Continue Daily Report/)).not.toBeInTheDocument();
    expect(screen.queryByText("Continue an unfinished report")).not.toBeInTheDocument();
  });

  it("swaps the hero itself to 'Continue Daily Report' when exactly one draft is open — same tap, no new UI", async () => {
    mockFetch({
      drafts: [
        {
          id: "draft-1",
          reportDate: "2026-09-19T00:00:00.000Z",
          updatedAt: "2026-09-19T12:00:00.000Z",
          site: { id: "site-1", name: "NH-48 Highway Widening" },
        },
      ],
    });

    await renderHome();

    const hero = screen.getByText("Continue Daily Report").closest("a");
    expect(hero).toHaveAttribute("href", "/dsr/new?siteId=site-1&date=2026-09-19");
    expect(screen.getByText(/NH-48 Highway Widening/)).toBeInTheDocument();
    expect(screen.queryByText("Start Daily Report")).not.toBeInTheDocument();
    // The multi-draft list must not also render for the single-draft case.
    expect(screen.queryByText("Continue an unfinished report")).not.toBeInTheDocument();
  });

  it("keeps the hero as 'Start Daily Report' and renders the list separately when 2+ drafts are open", async () => {
    mockFetch({
      drafts: [
        {
          id: "draft-1",
          reportDate: "2026-09-19T00:00:00.000Z",
          updatedAt: "2026-09-19T12:00:00.000Z",
          site: { id: "site-1", name: "NH-48 Highway Widening" },
        },
        {
          id: "draft-2",
          reportDate: "2026-09-18T00:00:00.000Z",
          updatedAt: "2026-09-18T09:30:00.000Z",
          site: { id: "site-2", name: "Riverside Residency" },
        },
      ],
    });

    await renderHome();

    expect(screen.getByText("Start Daily Report")).toBeInTheDocument();
    const section = screen.getByText("Continue an unfinished report").closest("div")!;
    expect(within(section.parentElement!).getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(within(section.parentElement!).getByText("Riverside Residency")).toBeInTheDocument();
  });

  it("degrades to the plain hero (never throws) when the drafts fetch fails", async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/dsr/drafts")) throw new Error("network down");
      return { ok: true, json: async () => ({ sitesReportingToday: 0, sitesMissingDsrToday: [] }) } as Response;
    }) as unknown as typeof fetch;

    await renderHome();

    expect(screen.getByText("Start Daily Report")).toBeInTheDocument();
  });
});
