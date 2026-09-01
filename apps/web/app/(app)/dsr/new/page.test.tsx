import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listQueuedDsrs, removeQueuedDsr } from "../../../../lib/offline-db";

import NewDsrPage from "./page";

// The form reads ?siteId= for the Site-detail deep link ("Today's DSR").
const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.current,
}));

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

function mockFetchRouter(handlers: {
  sites?: unknown;
  defaults?: unknown;
  teamMembers?: unknown;
  materials?: unknown;
  vendors?: unknown;
  expenseCategories?: unknown;
  machinery?: unknown;
  vehicles?: unknown;
  siteStock?: unknown;
  dsr?: { status: number; body?: unknown } | "network-error";
}) {
  global.fetch = vi.fn((url: string, init?: RequestInit) => {
    const urlStr = String(url);
    const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: async () => body });
    if (urlStr.includes("/dsr/defaults")) return ok(handlers.defaults ?? []);
    if (urlStr.includes("/stock/site/")) return ok(handlers.siteStock ?? []);
    if (urlStr.includes("/dsr") && init?.method === "POST") {
      const dsr = handlers.dsr;
      if (dsr === "network-error") {
        return Promise.reject(new Error("network error"));
      }
      const status = dsr?.status ?? 201;
      const body = dsr?.body ?? {};
      return Promise.resolve({ ok: status < 400, status, json: async () => body });
    }
    if (urlStr.includes("/sites")) return ok(handlers.sites ?? []);
    if (urlStr.includes("/team-members")) return ok(handlers.teamMembers ?? []);
    if (urlStr.includes("/materials")) return ok(handlers.materials ?? []);
    if (urlStr.includes("/vendors")) return ok(handlers.vendors ?? []);
    if (urlStr.includes("/expense-categories")) return ok(handlers.expenseCategories ?? []);
    if (urlStr.includes("/machinery")) return ok(handlers.machinery ?? []);
    if (urlStr.includes("/vehicles")) return ok(handlers.vehicles ?? []);
    return ok({});
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  // SiteField remembers the last Site on-device; tests must not leak it.
  window.localStorage.clear();
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  searchParams.current = new URLSearchParams();
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

    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());
    expect(screen.getByText("Crew present today")).toBeInTheDocument();
    expect(screen.getByText("Materials consumed")).toBeInTheDocument();
    expect(screen.getByText("RMC (ready-mix concrete) used")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Equipment used today")).toBeInTheDocument();
  });

  it("pre-selects the Site from the ?siteId= deep link (Site → Today's DSR)", async () => {
    searchParams.current = new URLSearchParams("siteId=site-2");
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48" },
        { id: "site-2", name: "Metro Depot" },
      ],
    });

    render(<NewDsrPage />);

    await waitFor(() => expect(screen.getByLabelText("Site")).toHaveValue("Metro Depot"));
    expect(screen.getByRole("button", { name: "Submit Daily Report" })).toBeEnabled();
  });

  it("pre-populates the crew checklist from the defaults endpoint once a Site and date are set", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      defaults: [{ teamMemberId: "tm-1", name: "Ramesh Yadav" }],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await screen.findByText("Ramesh Yadav");
    expect(screen.getByLabelText("Ramesh Yadav")).toBeChecked();
  });

  it("adds a crew member by typing a name and selecting — never by entering an id", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      teamMembers: [
        { id: "tm-1", name: "Ramesh Yadav", designation: "Mason" },
        { id: "tm-2", name: "Suresh Kumar", designation: "Operator" },
      ],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    const picker = screen.getByLabelText("Add crew member");
    await waitFor(() => expect(picker).toBeEnabled());
    await user.type(picker, "sur");
    await user.click(await screen.findByText("Suresh Kumar"));

    expect(screen.getByLabelText("Suresh Kumar")).toBeChecked();
    // The internal id never appears anywhere in the document.
    expect(document.body.textContent).not.toContain("tm-2");
  });

  it("selects a Material by typing and submits its materialSizeId internally", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      materials: [
        { id: "mat-1", name: "Cement", unit: { name: "Bags" }, sizes: [{ id: "ms-1", label: "OPC 43" }] },
        { id: "mat-2", name: "Steel", unit: { name: "Kg" }, sizes: [{ id: "ms-2", label: "12mm" }] },
      ],
      dsr: { status: 201, body: { id: "dsr-1" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Add material" }));

    const materialPicker = screen.getByLabelText("Material");
    await waitFor(() => expect(materialPicker).toBeEnabled());
    await user.type(materialPicker, "cem");
    await user.click(await screen.findByText("Cement — OPC 43"));
    // Once a Material is picked, the quantity label restates its unit so
    // "20" is never ambiguous.
    await user.type(screen.getByLabelText("Quantity (Bags)"), "20");

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    await screen.findByText("Synced");

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((postCall![1] as RequestInit).body as string) as {
      consumptions: { materialSizeId: string; quantity: number; clientGeneratedId: string }[];
    };
    expect(payload.consumptions).toHaveLength(1);
    expect(payload.consumptions[0]?.materialSizeId).toBe("ms-1");
    expect(payload.consumptions[0]?.quantity).toBe(20);
    expect(payload.consumptions[0]?.clientGeneratedId).toBeTruthy();
  });

  it("shows the current Site Stock for a selected Material (FR-14 visibility)", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      materials: [{ id: "mat-1", name: "Cement", unit: { name: "Bags" }, sizes: [{ id: "ms-1", label: "OPC 43" }] }],
      siteStock: [
        {
          materialSizeId: "ms-1",
          quantity: "80",
          materialSize: { material: { unit: { name: "Bags" } } },
        },
      ],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Add material" }));

    const materialPicker = screen.getByLabelText("Material");
    await waitFor(() => expect(materialPicker).toBeEnabled());
    await user.type(materialPicker, "cem");
    await user.click(await screen.findByText("Cement — OPC 43"));

    await screen.findByText("80 Bags available at this Site");
  });

  it("adds equipment from the Machinery/Vehicle registers, carrying type, id, and name", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      machinery: [{ id: "mac-1", name: "JCB 3DX", assetNumber: "AZ-01", type: { name: "Excavator" } }],
      vehicles: [{ id: "veh-1", number: "MH12AB1234", type: { name: "Tipper" } }],
      dsr: { status: 201, body: { id: "dsr-1" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    const picker = screen.getByLabelText("Add machinery or vehicle");
    await waitFor(() => expect(picker).toBeEnabled());
    await user.type(picker, "jcb");
    await user.click(await screen.findByText("JCB 3DX"));

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    await screen.findByText("Synced");

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((postCall![1] as RequestInit).body as string) as {
      equipmentUsed: { type: string; id: string; name: string }[];
    };
    expect(payload.equipmentUsed).toEqual([{ type: "MACHINERY", id: "mac-1", name: "JCB 3DX" }]);
  });

  it("disables submit until a Site is selected", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });
    render(<NewDsrPage />);

    expect(screen.getByRole("button", { name: "Submit Daily Report" })).toBeDisabled();
  });

  it("shows a conflict error inline, not a raw status, when the API returns 409", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dsr: { status: 409, body: { message: "A report for this Site today already exists" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));

    await screen.findByText("A report for this Site today already exists");
  });

  it("surfaces the stock-safety message when the API rejects with INSUFFICIENT_STOCK", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dsr: {
        status: 400,
        body: { error: { code: "INSUFFICIENT_STOCK", message: "Not enough Site Stock for this Consumption." } },
      },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));

    await screen.findByText("Not enough Site Stock for this Consumption.");
  });

  it('shows the "Synced" state when the submission reaches the server successfully', async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201 } });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));

    await screen.findByText("Synced");
    expect(await listQueuedDsrs()).toHaveLength(0);
  });

  it('falls back to the local queue and shows "Saved on device" when the network request fails — submitting never fails from the Supervisor\'s point of view (AC #1)', async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: "network-error" });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));

    await screen.findByText("Saved on device — will sync when back online");
    const queued = await listQueuedDsrs();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.payload.siteId).toBe("site-1");
  });
});
