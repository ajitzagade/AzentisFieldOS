import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ notFound: notFoundMock, useRouter: () => ({ push: pushMock }) }));

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
    if (urlStr.endsWith("/dsr/dsr-1")) {
      return Promise.resolve({ ok: true, json: async () => handlers.dsr ?? originalDsr() });
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

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByText(/the original report is never edited or deleted/)).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeInTheDocument();
    expect(screen.getByDisplayValue("RCC pour completed")).toBeInTheDocument();
    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByLabelText("Ravi Kumar")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeDisabled();
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
    await user.type(screen.getByLabelText("Reason for this correction"), "Ravi was actually present");
    await user.click(screen.getByRole("button", { name: "Submit Correction" }));

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
});
