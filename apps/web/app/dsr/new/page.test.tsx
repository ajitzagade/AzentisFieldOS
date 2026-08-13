import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listQueuedDsrs, removeQueuedDsr } from "../../../lib/offline-db";

import NewDsrPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

function mockFetchRouter(handlers: {
  sites?: unknown;
  defaults?: unknown;
  dsr?: { status: number; body?: unknown } | "network-error";
}) {
  global.fetch = vi.fn((url: string, init?: RequestInit) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites") && !urlStr.includes("/dsr")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    if (urlStr.includes("/dsr/defaults")) {
      return Promise.resolve({ ok: true, json: async () => handlers.defaults ?? [] });
    }
    if (urlStr.includes("/dsr") && init?.method === "POST") {
      const dsr = handlers.dsr;
      if (dsr === "network-error") {
        return Promise.reject(new Error("network error"));
      }
      const status = dsr?.status ?? 201;
      const body = dsr?.body ?? {};
      return Promise.resolve({ ok: status < 400, status, json: async () => body });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
});

afterEach(async () => {
  global.fetch = originalFetch;
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  vi.restoreAllMocks();
  const rows = await listQueuedDsrs();
  await Promise.all(rows.map((row) => removeQueuedDsr(row.localKey)));
});

describe("NewDsrPage", () => {
  it("loads Sites into the picker and renders the form sections", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });

    render(<NewDsrPage />);

    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());
    expect(screen.getByText("Crew present today")).toBeInTheDocument();
    expect(screen.getByText("Materials consumed")).toBeInTheDocument();
    expect(screen.getByText("RMC used")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Equipment used today")).toBeInTheDocument();
  });

  it("pre-populates the crew checklist from the defaults endpoint once a Site and date are set", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      defaults: [{ teamMemberId: "tm-1", name: "Ramesh Yadav" }],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Site"), "site-1");

    await screen.findByText("Ramesh Yadav");
    expect(screen.getByLabelText("Ramesh Yadav")).toBeChecked();
  });

  it("disables submit until a Site is selected", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });
    render(<NewDsrPage />);

    expect(screen.getByRole("button", { name: "Submit Daily Site Report" })).toBeDisabled();
  });

  it("shows a conflict error inline, not a raw status, when the API returns 409", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dsr: { status: 409, body: { message: "A report for this Site today already exists" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Site"), "site-1");
    await user.click(screen.getByRole("button", { name: "Submit Daily Site Report" }));

    await screen.findByText("A report for this Site today already exists");
  });

  it('shows the "Synced" state when the submission reaches the server successfully', async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201 } });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Site"), "site-1");
    await user.click(screen.getByRole("button", { name: "Submit Daily Site Report" }));

    await screen.findByText("Synced");
    expect(await listQueuedDsrs()).toHaveLength(0);
  });

  it('falls back to the local queue and shows "Saved on device" when the network request fails — submitting never fails from the Supervisor\'s point of view (AC #1)', async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: "network-error" });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Site"), "site-1");
    await user.click(screen.getByRole("button", { name: "Submit Daily Site Report" }));

    await screen.findByText("Saved on device — will sync when back online");
    const queued = await listQueuedDsrs();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.payload.siteId).toBe("site-1");
  });
});
