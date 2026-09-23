import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listQueuedDsrs, removeQueuedDsr } from "../../../../lib/offline-db";

import NewDsrPage from "./page";

// The form reads ?siteId= for the Site-detail deep link ("Today's DSR").
const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.current,
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

// The post-synced-submit navigation effect only cares about photo *upload*
// completion, not the real Cloudinary round trip — mocked at the module
// boundary (same approach dsr-desktop-form.test.tsx uses) so individual
// tests can control exactly when an upload resolves/rejects.
const uploadPhotoMock = vi.hoisted(() => vi.fn());
vi.mock("../../../../lib/photo-upload", () => ({
  uploadPhoto: uploadPhotoMock,
}));

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Client-readiness batch (goal 8): autosave is now keyed per (siteId,
// reportDate) — every direct localStorage assertion below needs the same
// key apps/web/lib/dsr-autosave.ts derives.
function autosaveKey(siteId: string, reportDate: string) {
  return `dsr-autosave-v1:${siteId}:${reportDate}`;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

function mockFetchRouter(handlers: {
  sites?: unknown;
  defaults?: unknown;
  teamMembers?: unknown;
  materials?: unknown;
  vendors?: unknown;
  expenseCategories?: unknown;
  machinery?: unknown;
  vehicles?: unknown;
  vehicleTypes?: unknown;
  subcontractors?: unknown;
  // spec-dsr-labour-dropdown: GET /daily-labourers?isActive=true.
  dailyLabourers?: unknown;
  siteStock?: unknown;
  dsr?: { status: number; body?: unknown } | "network-error";
  // spec-dsr-drafts: GET /dsr/draft resume response (default null = no draft),
  // POST /dsr/draft (Save Draft / pre-finalize save), POST /dsr/:id/finalize.
  draft?: unknown;
  saveDraft?: { status: number; body?: unknown };
  finalize?: { status: number; body?: unknown };
  // spec-dsr-photo-management: DELETE /photos/:id (Remove on a resumed
  // draft's already-uploaded photo).
  deletePhoto?: { status: number; body?: unknown };
}) {
  global.fetch = vi.fn((url: string, init?: RequestInit) => {
    // Review item 12: match on the parsed pathname + method, not fragile
    // substring ordering — so `/dsr/<id>/finalize`, `/dsr/draft` (GET/POST/
    // DELETE), and the one-shot `POST /dsr` can never be confused for each
    // other even when an id happens to start with "draft".
    const { pathname } = new URL(String(url), "http://localhost:3001");
    const method = (init?.method ?? "GET").toUpperCase();
    const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: async () => body });
    const withStatus = (r: { status: number; body?: unknown }, fallbackBody: unknown = {}) =>
      Promise.resolve({ ok: r.status < 400, status: r.status, json: async () => r.body ?? fallbackBody });

    if (pathname === "/dsr/defaults") return ok(handlers.defaults ?? []);
    if (pathname.startsWith("/stock/site/")) return ok(handlers.siteStock ?? []);

    // spec-dsr-drafts routes.
    if (pathname === "/dsr/draft" && method === "GET") return ok(handlers.draft ?? null);
    if (pathname === "/dsr/draft" && method === "POST") {
      return withStatus(handlers.saveDraft ?? { status: 200, body: { id: "draft-1" } }, { id: "draft-1" });
    }
    if (pathname.startsWith("/dsr/draft/") && method === "DELETE") return ok({ id: "draft-1" });
    if (/^\/dsr\/[^/]+\/finalize$/.test(pathname) && method === "POST") {
      return withStatus(handlers.finalize ?? { status: 200, body: { id: "draft-1" } });
    }
    if (pathname.startsWith("/photos/") && method === "DELETE") {
      return withStatus(handlers.deletePhoto ?? { status: 200, body: { id: "photo-1" } });
    }
    if (pathname === "/dsr" && method === "POST") {
      const dsr = handlers.dsr;
      if (dsr === "network-error") return Promise.reject(new Error("network error"));
      const status = dsr?.status ?? 201;
      return Promise.resolve({ ok: status < 400, status, json: async () => dsr?.body ?? {} });
    }

    if (pathname === "/sites" || pathname.startsWith("/sites/")) return ok(handlers.sites ?? []);
    if (pathname === "/team-members") return ok(handlers.teamMembers ?? []);
    if (pathname === "/materials") return ok(handlers.materials ?? []);
    if (pathname === "/vendors") return ok(handlers.vendors ?? []);
    if (pathname === "/expense-categories") return ok(handlers.expenseCategories ?? []);
    if (pathname === "/machinery") return ok(handlers.machinery ?? []);
    if (pathname === "/vehicles") return ok(handlers.vehicles ?? []);
    if (pathname === "/vehicle-types") return ok(handlers.vehicleTypes ?? []);
    if (pathname === "/subcontractors") return ok(handlers.subcontractors ?? []);
    if (pathname === "/daily-labourers") return ok(handlers.dailyLabourers ?? []);
    return ok({});
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  // SiteField remembers the last Site on-device; tests must not leak it.
  window.localStorage.clear();
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  searchParams.current = new URLSearchParams();
  pushMock.mockClear();
  uploadPhotoMock.mockReset();
  uploadPhotoMock.mockResolvedValue({ storageKey: "test-key" });
  // jsdom has no createObjectURL/revokeObjectURL — photo staging needs both.
  global.URL.createObjectURL = vi.fn(() => "blob:preview");
  global.URL.revokeObjectURL = vi.fn();
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
    expect(screen.getByText("Materials Used")).toBeInTheDocument();
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

  // "My Drafts" quick-resume (2026-09-21, deferred-work.md): a Resume link
  // from the Home page's drafts prompt deep-links both siteId AND date — the
  // draft-lookup effect is keyed on the (site,date) pair, so a Resume link
  // that only carried siteId would silently miss the draft and show a blank
  // form instead.
  it("pre-selects both Site and date from the ?siteId=&date= deep link (My Drafts → Continue)", async () => {
    searchParams.current = new URLSearchParams("siteId=site-2&date=2026-09-10");
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48" },
        { id: "site-2", name: "Metro Depot" },
      ],
      draft: {
        id: "draft-9",
        siteId: "site-2",
        reportDate: "2026-09-10",
        workCompleted: "Shuttering work",
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
        photos: [],
      },
    });

    render(<NewDsrPage />);

    await waitFor(() => expect(screen.getByLabelText("Site")).toHaveValue("Metro Depot"));
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-10");
    // Confirms the draft-lookup effect actually fired with the deep-linked
    // date, not today's — and picked up the draft it found.
    await screen.findByDisplayValue("Shuttering work");

    const draftLookupCall = (global.fetch as unknown as { mock: { calls: [string][] } }).mock.calls.find(
      ([url]) => String(url).includes("/dsr/draft?"),
    );
    expect(draftLookupCall?.[0]).toContain("siteId=site-2");
    expect(draftLookupCall?.[0]).toContain("date=2026-09-10");
  });

  // A malformed/hand-edited ?date= must never reach the server as an
  // Invalid Date — falls back to today, same as having no date param at all.
  it("falls back to today's date when the ?date= deep link is malformed", async () => {
    searchParams.current = new URLSearchParams("siteId=site-2&date=not-a-date");
    mockFetchRouter({ sites: [{ id: "site-2", name: "Metro Depot" }] });

    render(<NewDsrPage />);

    await waitFor(() => expect(screen.getByLabelText("Site")).toHaveValue("Metro Depot"));
    expect(screen.getByLabelText("Date")).toHaveValue(new Date().toISOString().slice(0, 10));
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
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));
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

  // spec-dsr-labour-dropdown: the Labour section is a searchable
  // ComboboxField backed by the DailyLabourer registry — one row = one
  // named person, no headcount field.
  it("selects a Labourer by typing and submits their labourerId internally", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dailyLabourers: [{ id: "l-1", name: "Ramesh", category: "Mistri" }],
      dsr: { status: 201, body: { id: "dsr-1" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Add labour" }));

    const labourPicker = screen.getByLabelText("Labour");
    await waitFor(() => expect(labourPicker).toBeEnabled());
    await user.type(labourPicker, "Ram");
    await user.click(await screen.findByText("Ramesh"));

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));
    await screen.findByText("Synced");

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((postCall![1] as RequestInit).body as string) as {
      labourEntries: { labourerId: string; clientGeneratedId: string }[];
    };
    expect(payload.labourEntries).toHaveLength(1);
    expect(payload.labourEntries[0]?.labourerId).toBe("l-1");
    expect(payload.labourEntries[0]?.clientGeneratedId).toBeTruthy();
    // No headcount field on the new shape (one row = one named person).
    expect(payload.labourEntries[0]).not.toHaveProperty("category");
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
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));
    await screen.findByText("Synced");

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((postCall![1] as RequestInit).body as string) as {
      equipmentUsed: { type: string; id: string; name: string }[];
    };
    expect(payload.equipmentUsed).toEqual([{ type: "MACHINERY", id: "mac-1", name: "JCB 3DX" }]);
  });

  // Matrix Test Audit (client-readiness batch, goal 2/row 4): "Other
  // Vehicle" is free text stored inline with the entry — it must never
  // resolve to (or create) a Machinery/Vehicle register id.
  it('adds "Other Vehicle" as free text, never resolving an id against the Machinery/Vehicle registers', async () => {
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
    await user.type(picker, "other");
    await user.click(await screen.findByText("Other Vehicle (not in register)"));

    await user.type(screen.getByLabelText("Describe this vehicle"), "Hired dumper — MH12 AB 9999");

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));
    await screen.findByText("Synced");

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((postCall![1] as RequestInit).body as string) as {
      equipmentUsed: { type: string; id: string; name: string; description?: string }[];
    };
    expect(payload.equipmentUsed).toHaveLength(1);
    const [row] = payload.equipmentUsed;
    expect(row).toMatchObject({ type: "OTHER", description: "Hired dumper — MH12 AB 9999" });
    // Never a Machinery/Vehicle register id — a fresh client-only key only.
    expect(row!.id).not.toBe("mac-1");
    expect(row!.id).not.toBe("veh-1");
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
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText("A report for this Site today already exists");
  });

  it("surfaces the stock-safety message when the API rejects with INSUFFICIENT_STOCK", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dsr: {
        status: 400,
        body: { error: { code: "INSUFFICIENT_STOCK", message: "Not enough Site Stock for this Material Used entry." } },
      },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText("Not enough Site Stock for this Material Used entry.");
  });

  it('shows the "Synced" state when the submission reaches the server successfully', async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201 } });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

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
    // Seed the autosave snapshot so the queued path's clearing is observable.
    await user.type(screen.getByLabelText("Work completed"), "Footings poured");
    await waitFor(
      () => expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull(),
      { timeout: 3000 },
    );
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText(/Saved on device — will sync when back online/);
    const queued = await listQueuedDsrs();
    expect(queued).toHaveLength(1);
    // Queued IS a durable home — the snapshot must not resurrect a copy of
    // entries that are already syncing from the offline queue.
    expect(window.localStorage.getItem(autosaveKey("site-1", today()))).toBeNull();
    expect(queued[0]?.payload.siteId).toBe("site-1");
  });

  // ---------- spec-dsr-drafts ----------

  it("Save Draft posts the parsed draft payload to /dsr/draft and confirms it's inert", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      materials: [{ id: "mat-1", name: "Cement", unit: { name: "Bags" }, sizes: [{ id: "ms-1", label: "OPC 43" }] }],
      saveDraft: { status: 200, body: { id: "draft-99" } },
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
    await user.type(screen.getByLabelText("Quantity (Bags)"), "20");

    await user.click(screen.getByRole("button", { name: "Save Draft" }));
    await screen.findByText(/Draft saved/);

    const draftCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([url, init]) => String(url).includes("/dsr/draft") && (init as RequestInit | undefined)?.method === "POST",
    );
    const payload = JSON.parse((draftCall![1] as RequestInit).body as string) as {
      siteId: string;
      consumptions: { materialSizeId: string; quantity: number; clientGeneratedId: string }[];
    };
    expect(payload.siteId).toBe("site-1");
    expect(payload.consumptions).toHaveLength(1);
    expect(payload.consumptions[0]?.materialSizeId).toBe("ms-1");
    expect(payload.consumptions[0]?.quantity).toBe(20);
    expect(payload.consumptions[0]?.clientGeneratedId).toBeTruthy();
  });

  it("resumes a saved draft on mount, pre-filling the form and offering Finalize + Discard", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-77",
        workCompleted: "Footing rebar tied",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    // The resumed narrative pre-fills, and the primary action becomes Finalize.
    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue("Footing rebar tied"));
    expect(screen.getByRole("button", { name: "Finalize Report" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
    // No one-shot Submit while a live draft exists.
    expect(screen.queryByRole("button", { name: "Submit Daily Report" })).not.toBeInTheDocument();
    // Review item 11: a banner tells the user they're continuing saved work.
    expect(screen.getByText(/Continuing your saved draft/)).toBeInTheDocument();
  });

  // spec-dsr-photo-management: a resumed draft's already-uploaded photos now
  // render (previously silently dropped) with their own immediate Remove.
  it("renders a resumed draft's already-uploaded photos, and Remove soft-deletes one immediately", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-88",
        workCompleted: "Footing rebar tied",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [
          { id: "photo-1", url: "https://cdn.example.com/photo-1.jpg" },
          { id: "photo-2", url: "https://cdn.example.com/photo-2.jpg" },
        ],
      },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue("Footing rebar tied"));

    const removeButtons = await screen.findAllByRole("button", { name: "Remove" });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]!);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/photos/photo-1?dailySiteReportId=draft-88"),
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(1));
  });

  it("Discard confirms first, then deletes the draft and clears the form (review item 7)", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-33",
        workCompleted: "Curing in progress",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue("Curing in progress"));
    // Edit after the resume so an autosave snapshot exists to clear.
    await user.type(screen.getByLabelText("Work completed"), " — extra note");
    await waitFor(
      () => expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull(),
      { timeout: 3000 },
    );
    await user.click(screen.getByRole("button", { name: "Discard" }));

    // Confirmed, DELETE fired, form reset back to the fresh one-shot layout.
    expect(confirmSpy).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Submit Daily Report" })).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Work completed")).toHaveValue("");
    // A discarded report's local snapshot must not resurrect it.
    expect(window.localStorage.getItem(autosaveKey("site-1", today()))).toBeNull();
    const deleteCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([url, init]) =>
        String(url).includes("/dsr/draft/") && (init as RequestInit | undefined)?.method === "DELETE",
    );
    expect(deleteCall).toBeTruthy();
    confirmSpy.mockRestore();
  });

  it("Discard aborts when the user cancels the confirm (no DELETE)", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-22",
        workCompleted: "Keep me",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue("Keep me"));
    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(confirmSpy).toHaveBeenCalledOnce();
    // Cancelled — the draft is still active and nothing was deleted.
    expect(screen.getByRole("button", { name: "Finalize Report" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work completed")).toHaveValue("Keep me");
    const deleteCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([url, init]) =>
        String(url).includes("/dsr/draft/") && (init as RequestInit | undefined)?.method === "DELETE",
    );
    expect(deleteCall).toBeUndefined();
    confirmSpy.mockRestore();
  });

  it("Finalize saves the latest state then finalizes, showing Synced", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-55",
        workCompleted: "Slab poured",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
      saveDraft: { status: 200, body: { id: "draft-55" } },
      finalize: { status: 200, body: { id: "draft-55", status: "SUBMITTED" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await screen.findByRole("button", { name: "Finalize Report" });
    await user.click(screen.getByRole("button", { name: "Finalize Report" }));
    // The playback dialog now guards finalization — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Finalize" }));

    await screen.findByText("Synced");
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.some(([url, init]) => String(url).includes("/dsr/draft") && (init as RequestInit | undefined)?.method === "POST")).toBe(true);
    expect(calls.some(([url, init]) => String(url).includes("/finalize") && (init as RequestInit | undefined)?.method === "POST")).toBe(true);
  });

  it("surfaces INSUFFICIENT_STOCK inline when Finalize is rejected", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-44",
        workCompleted: null,
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
      saveDraft: { status: 200, body: { id: "draft-44" } },
      finalize: {
        status: 400,
        body: { error: { code: "INSUFFICIENT_STOCK", message: "Not enough Site Stock for this Material Used entry." } },
      },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await screen.findByRole("button", { name: "Finalize Report" });
    await user.click(screen.getByRole("button", { name: "Finalize Report" }));
    // The playback dialog now guards finalization — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Finalize" }));

    await screen.findByText("Not enough Site Stock for this Material Used entry.");
    // Still a draft — Finalize remains available for a retry after fixing stock.
    expect(screen.getByRole("button", { name: "Finalize Report" })).toBeInTheDocument();
  });

  it("autosaves typed entries and restores them after an interrupted session (lib/dsr-autosave)", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });

    const { unmount } = render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.type(screen.getByLabelText("Work completed"), "Poured slab for block A");

    // The debounced (800ms) snapshot must land before the "app closes".
    await waitFor(
      () => expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull(),
      { timeout: 3000 },
    );
    unmount();

    render(<NewDsrPage />);
    // Restore banner + the typed narrative back in the field.
    await screen.findByText(/we restored the entries you were working on/i);
    await waitFor(() =>
      expect(screen.getByLabelText("Work completed")).toHaveValue("Poured slab for block A"),
    );
  });

  it("clears the autosave snapshot once the report is submitted", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      dsr: { status: 201, body: { id: "dsr-1" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.type(screen.getByLabelText("Work completed"), "Shuttering done");
    await waitFor(
      () => expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull(),
      { timeout: 3000 },
    );

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));
    await screen.findByText("Synced");

    // Durably on the server — the local safety net must not resurrect it.
    expect(window.localStorage.getItem(autosaveKey("site-1", today()))).toBeNull();
  });

  it("restores the crew checklist and does NOT let the crew-defaults fetch clobber it", async () => {
    window.localStorage.setItem(
      autosaveKey("site-1", today()),
      JSON.stringify({
        savedAt: Date.now(),
        data: {
          siteId: "site-1",
          reportDate: today(),
          workCompleted: "Slab work",
          issuesBlockers: "",
          crew: [{ teamMemberId: "tm-9", name: "Restored Person", attended: true }],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          hadPhotos: false,
        },
      }),
    );
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      defaults: [{ teamMemberId: "tm-1", name: "Default Person" }],
    });

    render(<NewDsrPage />);

    await screen.findByText(/we restored the entries you were working on/i);
    // The restored checklist survives; the Site's default checklist (which
    // the effect fetches when no draft exists) must not overwrite it.
    await waitFor(() => expect(screen.getByText("Restored Person")).toBeInTheDocument());
    expect(screen.queryByText("Default Person")).not.toBeInTheDocument();
  });

  it("does not hijack a deep-linked ?siteId= for a different Site with a restore, and keeps the snapshot", async () => {
    window.localStorage.setItem(
      autosaveKey("site-1", today()),
      JSON.stringify({
        savedAt: Date.now(),
        data: {
          siteId: "site-1",
          reportDate: today(),
          workCompleted: "Interrupted entries for NH-48",
          issuesBlockers: "",
          crew: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          hadPhotos: false,
        },
      }),
    );
    searchParams.current = new URLSearchParams("siteId=site-2");
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48" },
        { id: "site-2", name: "Metro Depot" },
      ],
    });

    render(<NewDsrPage />);

    // Deep-link intent wins: Metro Depot selected, nothing restored...
    await waitFor(() => expect(screen.getByLabelText("Site")).toHaveValue("Metro Depot"));
    expect(screen.queryByText(/we restored the entries/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Work completed")).toHaveValue("");
    // ...and the other session's snapshot is preserved, not clobbered.
    expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull();
  });

  // "My Drafts" quick-resume (2026-09-21): same guard as above, extended to
  // date — a stale local snapshot for the SAME Site but a DIFFERENT date
  // must not silently override an explicitly deep-linked ?date=, or a
  // Resume link would land on the wrong day's (empty) form instead of the
  // draft it was pointed at.
  it("does not hijack a deep-linked ?date= for the same Site with a same-Site-different-date snapshot", async () => {
    window.localStorage.setItem(
      autosaveKey("site-1", "2026-01-01"),
      JSON.stringify({
        savedAt: Date.now(),
        data: {
          siteId: "site-1",
          reportDate: "2026-01-01",
          workCompleted: "Stale entries from a different day",
          issuesBlockers: "",
          crew: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          hadPhotos: false,
        },
      }),
    );
    searchParams.current = new URLSearchParams("siteId=site-1&date=2026-09-10");
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-9",
        siteId: "site-1",
        reportDate: "2026-09-10",
        workCompleted: "The actual draft being resumed",
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
        photos: [],
      },
    });

    render(<NewDsrPage />);

    // Deep-linked date wins: the form stays on 2026-09-10 and resumes the
    // real server draft for that date, never the stale 2026-01-01 snapshot.
    await waitFor(() => expect(screen.getByLabelText("Date")).toHaveValue("2026-09-10"));
    await screen.findByDisplayValue("The actual draft being resumed");
    expect(screen.queryByDisplayValue("Stale entries from a different day")).not.toBeInTheDocument();
    // The other day's snapshot is preserved, not clobbered.
    expect(window.localStorage.getItem(autosaveKey("site-1", "2026-01-01"))).not.toBeNull();
  });

  // Client-readiness batch (goal 8): the actual reported bug — switching
  // Site+Date mid-session (no remount) leaked the previous pair's in-memory
  // state into the new one, since only `crew` was ever reset when the new
  // pair had no server draft.
  it("resets every field (not just crew) when switching Site+Date mid-session to a pair with no draft (goal 8)", async () => {
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48" },
        { id: "site-2", name: "Metro Depot" },
      ],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.type(screen.getByLabelText("Work completed"), "Footings for Site A");
    await user.type(screen.getByLabelText("Issues / blockers"), "Rebar delivery delayed");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue("Footings for Site A"));

    // Switch Site mid-session — no remount, no server draft for the new pair.
    await user.clear(screen.getByLabelText("Site"));
    await user.type(screen.getByLabelText("Site"), "Metro");
    await user.click(await screen.findByText("Metro Depot"));

    // Every field resets to blank/defaults, not just crew — the old Site's
    // narrative and sub-record rows must not bleed into the new one.
    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue(""));
    expect(screen.getByLabelText("Issues / blockers")).toHaveValue("");
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
  });

  // Matrix Test Audit (client-readiness batch, goal 8/row 7): switching
  // back to a Site+Date pair that has its OWN unsaved local autosave must
  // restore that pair's own content — not stay blank, and not show the
  // other pair's content (the actual reported bug's mirror image).
  it("switching back to a Site+Date pair with its own local draft restores that pair's own content (goal 8)", async () => {
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48" },
        { id: "site-2", name: "Metro Depot" },
      ],
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    // Site A: type content and let the debounced autosave land.
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.type(screen.getByLabelText("Work completed"), "Footings for Site A");
    await waitFor(
      () => expect(window.localStorage.getItem(autosaveKey("site-1", today()))).not.toBeNull(),
      { timeout: 3000 },
    );

    // Switch to Site B — no draft there, so it resets blank.
    await user.clear(screen.getByLabelText("Site"));
    await user.type(screen.getByLabelText("Site"), "Metro");
    await user.click(await screen.findByText("Metro Depot"));
    await waitFor(() => expect(screen.getByLabelText("Work completed")).toHaveValue(""));

    // Switch BACK to Site A — its own autosaved content must come back,
    // not blank and not Site B's (empty) content.
    await user.clear(screen.getByLabelText("Site"));
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await waitFor(() =>
      expect(screen.getByLabelText("Work completed")).toHaveValue("Footings for Site A"),
    );
  });

  // ---------- post-synced-submit navigation ----------

  it("navigates to /daily-activity/history with a success flash once an online submit with zero photos syncs", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201, body: { id: "dsr-1" } } });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText("Synced");
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/daily-activity/history?flash=Daily%20Report%20submitted"),
    );
  });

  it("waits for every staged photo to finish uploading before navigating after an online submit", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201, body: { id: "dsr-1" } } });
    let resolveUpload!: (value: { storageKey: string }) => void;
    uploadPhotoMock.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
    );

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    const fileInput = document.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, {
      target: { files: [new File(["bytes"], "site.jpg", { type: "image/jpeg" })] },
    });

    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText("Synced");
    // The report itself is synced, but its one photo is still mid-upload —
    // navigation must wait rather than strand the Supervisor mid-transition.
    await waitFor(() => expect(screen.getByText("Uploading…")).toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();

    resolveUpload({ storageKey: "test-key" });
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/daily-activity/history?flash=Daily%20Report%20submitted"),
    );
  });

  it("does not navigate when the submit falls back to the offline queue, and keeps the queued inline message", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: "network-error" });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));
    await user.click(screen.getByRole("button", { name: "Submit Daily Report" }));
    // The playback dialog now guards submission — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Submit" }));

    await screen.findByText(/Saved on device — will sync when back online/);
    // Give any (incorrect) navigation effect a turn to fire before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(pushMock).not.toHaveBeenCalled();
    // The offline inline message is still shown — no toast, no navigation.
    expect(screen.getByText(/Saved on device — will sync when back online/)).toBeInTheDocument();
  });

  it("navigates to /daily-activity/history with a success flash once Finalize succeeds", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      draft: {
        id: "draft-55",
        workCompleted: "Slab poured",
        issuesBlockers: null,
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        photos: [],
      },
      saveDraft: { status: 200, body: { id: "draft-55" } },
      finalize: { status: 200, body: { id: "draft-55", status: "SUBMITTED" } },
    });

    render(<NewDsrPage />);
    await waitFor(() => expect(screen.getByLabelText("Site")).not.toBeDisabled());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Site"), "NH");
    await user.click(await screen.findByText("NH-48"));

    await screen.findByRole("button", { name: "Finalize Report" });
    await user.click(screen.getByRole("button", { name: "Finalize Report" }));
    // The playback dialog now guards finalization — confirm to proceed.
    await user.click(await screen.findByRole("button", { name: "Confirm & Finalize" }));

    await screen.findByText("Synced");
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/daily-activity/history?flash=Daily%20Report%20submitted"),
    );
  });
});
