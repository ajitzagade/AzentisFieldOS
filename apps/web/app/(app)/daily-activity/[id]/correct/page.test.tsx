import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ notFound: notFoundMock, useRouter: () => ({ push: pushMock }), useSearchParams: () => new URLSearchParams() }));

import CorrectDsrPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;
const originalPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;

function originalDsr() {
  return {
    id: "dsr-1",
    site: { id: "site-1", name: "NH-48 Highway Widening" },
    reportDate: "2026-08-11",
    workCompleted: "RCC pour completed",
    issuesBlockers: null,
    equipmentUsed: [],
    workRecords: [{ teamMemberId: "tm-1", teamMember: { name: "Ravi Kumar" }, attended: false }],
    consumptions: [],
    rmcEntries: [],
    expenses: [],
  };
}

function mockFetchRouter(handlers: {
  dsr?: unknown;
  sites?: unknown;
  correct?: { status: number; body?: unknown };
  vendors?: unknown;
  // spec-dsr-labour-dropdown: GET /daily-labourers?isActive=true.
  dailyLabourers?: unknown;
}) {
  global.fetch = vi.fn((url: string, init?: RequestInit) => {
    const urlStr = String(url);
    if (urlStr.includes("/correct") && init?.method === "POST") {
      const status = handlers.correct?.status ?? 201;
      return Promise.resolve({ ok: status < 400, status, json: async () => handlers.correct?.body ?? { id: "dsr-2" } });
    }
    if (urlStr.includes("/sites") && !urlStr.includes("/dsr")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    if (urlStr.includes("/vendors")) {
      return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
    }
    if (urlStr.includes("/daily-labourers")) {
      return Promise.resolve({ ok: true, json: async () => handlers.dailyLabourers ?? [] });
    }
    if (urlStr.endsWith("/dsr/dsr-1")) {
      return Promise.resolve({ ok: true, json: async () => handlers.dsr ?? originalDsr() });
    }
    // useDsrReferenceData's list endpoints (materials/team/expense-categories/
    // machinery/vehicles/vehicle-types/subcontractors) — must be arrays or
    // the reference hook errors out. (/daily-labourers is handled above.)
    if (/\/(materials|team-members|expense-categories|machinery|vehicles|vehicle-types|subcontractors)(\?|$)/.test(urlStr)) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
  pushMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  process.env.NEXT_PUBLIC_API_URL = originalPublicApiUrl;
  vi.restoreAllMocks();
});

async function renderCorrectPage(id: string) {
  const element = await CorrectDsrPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("CorrectDsrPage", () => {
  it("pre-fills from the original report and shows the correction banner with a required reason field (AC #2)", async () => {
    mockFetchRouter({});

    await renderCorrectPage("dsr-1");

    expect(screen.getByText("Editing this report")).toBeInTheDocument();
    expect(screen.getByText(/the original report is never overwritten or deleted/)).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this edit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("RCC pour completed")).toBeInTheDocument();
    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByLabelText("Ravi Kumar")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Save Edit" })).toBeDisabled();
  });

  it("locks the Site and Date fields — a correction must keep the same Site/date as the report it corrects (AC #4)", async () => {
    mockFetchRouter({});

    await renderCorrectPage("dsr-1");

    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Date")).toBeDisabled();
  });

  it("submits to POST /dsr/:id/correct with the reason, and navigates to the correction on success (AC #2, #4)", async () => {
    mockFetchRouter({
      correct: { status: 201, body: { id: "dsr-2", correctsId: "dsr-1" } },
      sites: [{ id: "site-1", name: "NH-48 Highway Widening" }],
    });

    await renderCorrectPage("dsr-1");
    // The Site <select>'s pre-filled value ("site-1", from the original
    // report) only becomes a real, selectable DOM option once the client
    // component's own Sites fetch resolves — wait for it, matching how a
    // controlled <select> with no matching <option> yet fails HTML5
    // required-field validation on submit.
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Reason for this edit"), "Ravi was actually present");
    await user.click(screen.getByRole("button", { name: "Save Edit" }));

    // The submission is held for re-verification first (FR-54 UX) — the
    // dialog plays the entry back, then Confirm dispatches the real POST.
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Ravi was actually present")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Save Edit" }));

    await waitFor(() => {
      const correctCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
        String(call[0]).includes("/dsr/dsr-1/correct"),
      );
      expect(correctCall).toBeDefined();
    });

    const correctCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
      String(call[0]).includes("/dsr/dsr-1/correct"),
    );
    const body = JSON.parse((correctCall?.[1] as RequestInit).body as string);
    expect(body.reason).toBe("Ravi was actually present");
    expect(pushMock).toHaveBeenCalled();
  });

  it("calls notFound() for a report ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  // Ported from the deleted /daily-activity/new test (review 2026-09-02):
  // Story 9.1's rule — an RMC row's Vendor is the searchable picker bound to
  // the Vendor list, never free text, and the raw vendor id never renders.
  it("sources an RMC row's Vendor field from the Vendor list via a searchable picker (Story 9.1)", async () => {
    mockFetchRouter({
      dsr: {
        ...originalDsr(),
        rmcEntries: [
          {
            vendorId: "vendor-77",
            vendor: { id: "vendor-77", name: "Anand RMC Suppliers" },
            quantityM3: "12",
            grade: "M25",
            ratePerM3: "6200",
            totalAmount: "74400",
          },
        ],
      },
      vendors: [{ id: "vendor-77", name: "Anand RMC Suppliers" }],
    });

    await renderCorrectPage("dsr-1");

    const vendorPicker = await screen.findByLabelText("Vendor");
    expect(vendorPicker).toHaveAttribute("role", "combobox");
    // The picker displays the vendor's NAME once its options resolve — and
    // the raw id never appears anywhere in the rendered page.
    await waitFor(() => expect(vendorPicker).toHaveValue("Anand RMC Suppliers"));
    expect(document.body.textContent).not.toContain("vendor-77");
  });

  // spec-dsr-labour-dropdown.
  describe("Labour section", () => {
    it("pre-fills a new-shape labour row via the Labour picker and re-submits its labourerId unchanged", async () => {
      mockFetchRouter({
        dsr: { ...originalDsr(), labourEntries: [{ labourerId: "l-1" }] },
        dailyLabourers: [{ id: "l-1", name: "Ramesh", category: "Mistri" }],
        sites: [{ id: "site-1", name: "NH-48 Highway Widening" }],
        correct: { status: 201, body: { id: "dsr-2", correctsId: "dsr-1" } },
      });

      await renderCorrectPage("dsr-1");

      const labourPicker = await screen.findByLabelText("Labour");
      await waitFor(() => expect(labourPicker).toHaveValue("Ramesh"));

      const user = userEvent.setup();
      await user.type(screen.getByLabelText("Reason for this edit"), "No change to labour");
      await user.click(screen.getByRole("button", { name: "Save Edit" }));
      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Save Edit" }));

      await waitFor(() => expect(pushMock).toHaveBeenCalled());
      const correctCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
        String(call[0]).includes("/dsr/dsr-1/correct"),
      );
      const body = JSON.parse((correctCall?.[1] as RequestInit).body as string);
      expect(body.labourEntries).toHaveLength(1);
      expect(body.labourEntries[0].labourerId).toBe("l-1");
    });

    it("drops a historical legacy {category, men, women} labour row from the pre-filled form (not reproducible in the picker-only UI)", async () => {
      mockFetchRouter({
        dsr: { ...originalDsr(), labourEntries: [{ category: "Mason", men: 2, women: 0 }] },
        sites: [{ id: "site-1", name: "NH-48 Highway Widening" }],
        correct: { status: 201, body: { id: "dsr-2", correctsId: "dsr-1" } },
      });

      await renderCorrectPage("dsr-1");

      // No Labour row is pre-filled — the legacy shape has no labourerId to
      // select, and "Mason" (the old free-text category) never appears.
      expect(screen.queryByLabelText("Labour")).not.toBeInTheDocument();
      expect(document.body.textContent).not.toContain("Mason");
      // The user is warned before submitting, rather than silently losing
      // this row from the edited version.
      expect(screen.getByText(/1 Labour entry uses an older format/)).toBeInTheDocument();

      const user = userEvent.setup();
      await user.type(screen.getByLabelText("Reason for this edit"), "Fixed materials");
      await user.click(screen.getByRole("button", { name: "Save Edit" }));
      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Save Edit" }));

      await waitFor(() => expect(pushMock).toHaveBeenCalled());
      const correctCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
        String(call[0]).includes("/dsr/dsr-1/correct"),
      );
      const body = JSON.parse((correctCall?.[1] as RequestInit).body as string);
      expect(body.labourEntries).toHaveLength(0);
    });
  });
});
