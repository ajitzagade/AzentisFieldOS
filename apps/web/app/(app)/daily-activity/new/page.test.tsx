import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }), useSearchParams: () => new URLSearchParams() }));

import NewDsrDesktopPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

function mockFetchRouter(handlers: {
  sites?: unknown;
  defaults?: unknown;
  dsr?: { status: number; body?: unknown };
  vendors?: unknown;
}) {
  global.fetch = vi.fn((url: string, init?: RequestInit) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites") && !urlStr.includes("/dsr")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    if (urlStr.includes("/vendors")) {
      return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
    }
    if (urlStr.includes("/dsr/defaults")) {
      return Promise.resolve({ ok: true, json: async () => handlers.defaults ?? [] });
    }
    if (urlStr.includes("/dsr") && init?.method === "POST") {
      const status = handlers.dsr?.status ?? 201;
      return Promise.resolve({ ok: status < 400, status, json: async () => handlers.dsr?.body ?? { id: "dsr-1" } });
    }
    // Reference-list endpoints (/materials, /team-members, /expense-categories,
    // /machinery, /vehicles) all return arrays.
    return Promise.resolve({ ok: true, json: async () => [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  pushMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("NewDsrDesktopPage", () => {
  it("loads Sites and renders the same field set as the mobile flow (AC #1)", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });

    render(<NewDsrDesktopPage />);

    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());
    expect(screen.getByText("Crew present")).toBeInTheDocument();
    expect(screen.getByText("Materials consumed")).toBeInTheDocument();
    expect(screen.getByText("RMC used")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Equipment used")).toBeInTheDocument();
    expect(screen.getByText("Site Photos")).toBeInTheDocument();
  });

  it("submits to POST /dsr (Story 3.1's endpoint) and navigates to the new report on success (AC #1)", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }], dsr: { status: 201, body: { id: "dsr-new" } } });

    render(<NewDsrDesktopPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Site"), "site-1");
    await user.click(screen.getByRole("button", { name: "Submit Daily Activity" }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringMatching(/^\/daily-activity\/dsr-new\?flash=/)),
    );

    const postCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (call) => String(call[0]).endsWith("/dsr") && (call[1] as RequestInit)?.method === "POST",
    );
    expect(postCall).toBeDefined();
  });

  it("does not offer a drag-drop dropzone that pretends to be a camera-tap button — shows the desktop-appropriate copy (AC #3)", async () => {
    mockFetchRouter({ sites: [{ id: "site-1", name: "NH-48" }] });
    render(<NewDsrDesktopPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    expect(screen.getByText(/Drag and drop photos here/)).toBeInTheDocument();
  });

  it("Story 9.1: sources an RMC row's Vendor field from the Vendor list via the searchable picker, not free text", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48" }],
      vendors: [{ id: "v1", name: "Anand RMC Suppliers" }],
    });

    render(<NewDsrDesktopPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "NH-48" })).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add RMC delivery" }));

    const vendorPicker = await screen.findByLabelText("Vendor");
    expect(vendorPicker).toHaveAttribute("role", "combobox");
    await waitFor(() => expect(vendorPicker).toBeEnabled());
    await user.type(vendorPicker, "anand");
    await user.click(await screen.findByText("Anand RMC Suppliers"));
    expect(vendorPicker).toHaveValue("Anand RMC Suppliers");
    // The internal id never appears anywhere in the document.
    expect(document.body.textContent).not.toContain("v1");
  });
});
