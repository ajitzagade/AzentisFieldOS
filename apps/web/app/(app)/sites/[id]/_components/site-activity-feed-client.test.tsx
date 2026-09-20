import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedItem } from "@azentisfieldos/shared";

// site-activity-feed-client.tsx computes a shareable panel-open href
// directly via usePathname/useSearchParams (not just through
// useDetailPanelState) — mocked the same way use-detail-panel-state.test.ts
// mocks next/navigation.
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => "/sites/site-1",
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace: vi.fn() }),
}));

const panelOpen = vi.fn();
const panelClose = vi.fn();
let panelId: string | null = null;
vi.mock("../../../../../lib/use-detail-panel-state", () => ({
  useDetailPanelState: () => ({ id: panelId, open: panelOpen, close: panelClose }),
}));

const authedFetchMock = vi.fn();
vi.mock("../../../../../lib/use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mocks above so the component's own hook calls resolve
// to them (vi.mock is hoisted by Vitest's transform, so this static import
// already sees it).
import { SiteActivityFeedClient } from "./site-activity-feed-client";

const purchaseItem: FeedItem = {
  id: "purchase-1",
  type: "PURCHASE",
  occurredAt: "2026-09-20T10:00:00.000Z",
  summary: "Cement (50kg), 100 — from Test Vendor",
  amount: 45000,
};

const workRecordItem: FeedItem = {
  id: "wr-1",
  type: "WORK_RECORD",
  occurredAt: "2026-09-20T10:00:00.000Z",
  summary: "Ravi Kumar — present",
  amount: null,
};

beforeEach(() => {
  panelId = null;
  searchParams = new URLSearchParams();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SiteActivityFeedClient", () => {
  it("shows the empty state when the feed has no rows", () => {
    render(<SiteActivityFeedClient feed={[]} />);
    expect(screen.getAllByText("No activity logged yet for this Site.")).not.toHaveLength(0);
  });

  it("renders each feed row with its type badge, summary, and amount", () => {
    render(<SiteActivityFeedClient feed={[purchaseItem]} />);
    expect(screen.getAllByText("Purchase").length).toBeGreaterThan(0);
    expect(screen.getAllByText(purchaseItem.summary).length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹45,000").length).toBeGreaterThan(0);
  });

  // Review fix (finding #9): a Waste Material correction-delta row can
  // carry a negative amount — the sign must render before the ₹ symbol.
  it("renders a negative amount (e.g. a Waste Material correction delta) sign-first, not '₹-2,000'", () => {
    const negativeItem: FeedItem = {
      id: "waste-1",
      type: "WASTE_DISPOSAL",
      occurredAt: "2026-09-20T10:00:00.000Z",
      summary: "Debris disposal — -2 trips",
      amount: -2000,
    };
    render(<SiteActivityFeedClient feed={[negativeItem]} />);
    expect(screen.getAllByText("−₹2,000").length).toBeGreaterThan(0);
    expect(screen.queryByText("₹-2,000")).not.toBeInTheDocument();
  });

  it("opens the panel (via panel.open) on a plain left-click, instead of navigating", () => {
    render(<SiteActivityFeedClient feed={[purchaseItem]} />);
    const link = within(screen.getByRole("table")).getByText(purchaseItem.summary).closest("a") as HTMLAnchorElement;
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false);
    expect(panelOpen).toHaveBeenCalledWith("PURCHASE:purchase-1");
  });

  it("gives every row a shareable panel-open href, even for a type with no confirmed detail page", () => {
    render(<SiteActivityFeedClient feed={[workRecordItem]} />);
    const link = within(screen.getByRole("table")).getByText(workRecordItem.summary).closest("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/sites/site-1?feedItem=WORK_RECORD%3Awr-1");
  });

  describe("detail panel", () => {
    it("fetches GET /purchases/:id and renders full fields plus a View Full Details link", async () => {
      panelId = "PURCHASE:purchase-1";
      authedFetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "purchase-1",
          vendor: { name: "Test Vendor" },
          materialSize: { label: "50kg", material: { name: "Cement", unit: { name: "Bag" } } },
          quantity: "100",
          destination: "SITE",
          totalAmount: 45000,
          paymentStatus: "PAID",
        }),
      });

      render(<SiteActivityFeedClient feed={[purchaseItem]} />);

      expect(authedFetchMock).toHaveBeenCalledWith("/purchases/purchase-1");
      expect(await screen.findByText("Test Vendor")).toBeInTheDocument();
      const detailLink = screen.getByRole("link", { name: /View Full Details/ });
      expect(detailLink).toHaveAttribute("href", "/movements/purchases/purchase-1/correct");
    });

    it("omits the View Full Details link for a type with no confirmed target route (WORK_RECORD)", async () => {
      panelId = "WORK_RECORD:wr-1";
      authedFetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "wr-1",
          teamMember: { name: "Ravi Kumar" },
          site: { name: "Test Site" },
          attended: true,
          hours: 8,
        }),
      });

      render(<SiteActivityFeedClient feed={[workRecordItem]} />);

      expect(await screen.findByText("Ravi Kumar")).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /View Full Details/ })).not.toBeInTheDocument();
    });

    it("shows a not-found state when the fetch 404s", async () => {
      panelId = "PURCHASE:missing";
      authedFetchMock.mockResolvedValue({ ok: false, status: 404 });

      render(<SiteActivityFeedClient feed={[purchaseItem]} />);

      expect(await screen.findByText("This record could not be found.")).toBeInTheDocument();
    });

    // Review fix (finding #8): an invalid/unknown type in a hand-edited or
    // stale `feedItem` URL param must degrade to a clean "not found," not
    // a generic error/retry state — and must never even attempt a fetch.
    it("shows a not-found state for an unknown feed item type, without fetching", async () => {
      panelId = "NOT_A_REAL_TYPE:some-id";

      render(<SiteActivityFeedClient feed={[purchaseItem]} />);

      expect(await screen.findByText("This record could not be found.")).toBeInTheDocument();
      expect(authedFetchMock).not.toHaveBeenCalled();
    });

    it("shows an error state with a working retry on a fetch failure", async () => {
      panelId = "PURCHASE:purchase-1";
      authedFetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      render(<SiteActivityFeedClient feed={[purchaseItem]} />);

      expect(await screen.findByText("Couldn't load this record.")).toBeInTheDocument();

      authedFetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "purchase-1",
          vendor: { name: "Test Vendor" },
          materialSize: { label: "50kg", material: { name: "Cement", unit: { name: "Bag" } } },
          quantity: "100",
          totalAmount: 45000,
        }),
      });
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));

      expect(await screen.findByText("Test Vendor")).toBeInTheDocument();
    });
  });
});
