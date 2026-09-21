import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authedFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mock above so the component's own useAuthedFetch()
// call resolves to it (vi.mock is hoisted by Vitest's transform, so this
// static import already sees it).
import { ResumeDraftsList, type DraftSummary } from "./resume-drafts-list";

const drafts: DraftSummary[] = [
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
];

let confirmSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  authedFetchMock.mockReset();
  confirmSpy = vi.spyOn(window, "confirm");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// "My Drafts" quick-resume (2026-09-21, deferred-work.md).
describe("ResumeDraftsList", () => {
  it("renders nothing when there are no drafts", () => {
    const { container } = render(<ResumeDraftsList drafts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each draft's Site, date, and a Continue link to the right (site, date) pair", () => {
    render(<ResumeDraftsList drafts={drafts} />);

    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Riverside Residency")).toBeInTheDocument();

    const continueLinks = screen.getAllByRole("link", { name: "Continue" });
    expect(continueLinks[0]).toHaveAttribute("href", "/dsr/new?siteId=site-1&date=2026-09-19");
    expect(continueLinks[1]).toHaveAttribute("href", "/dsr/new?siteId=site-2&date=2026-09-18");
  });

  it("discards a draft after confirming, removing it from the list without touching the others", async () => {
    confirmSpy.mockReturnValue(true);
    authedFetchMock.mockResolvedValue({ ok: true });

    render(<ResumeDraftsList drafts={drafts} />);

    fireEvent.click(screen.getByRole("button", { name: "Discard draft for NH-48 Highway Widening" }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("NH-48 Highway Widening"));
    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledWith("/dsr/draft/draft-1", { method: "DELETE" }));
    await waitFor(() => expect(screen.queryByText("NH-48 Highway Widening")).not.toBeInTheDocument());
    expect(screen.getByText("Riverside Residency")).toBeInTheDocument();
  });

  it("does not call the API or remove the row when the confirm is dismissed", () => {
    confirmSpy.mockReturnValue(false);

    render(<ResumeDraftsList drafts={drafts} />);
    fireEvent.click(screen.getByRole("button", { name: "Discard draft for NH-48 Highway Widening" }));

    expect(authedFetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
  });

  it("keeps the row in place when the DELETE fails", async () => {
    confirmSpy.mockReturnValue(true);
    authedFetchMock.mockResolvedValue({ ok: false, status: 500 });

    render(<ResumeDraftsList drafts={drafts} />);
    fireEvent.click(screen.getByRole("button", { name: "Discard draft for NH-48 Highway Widening" }));

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalled());
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
  });
});
