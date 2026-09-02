import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RecentlyViewedChips } from "./recently-viewed-chips";
import { clearRecentlyViewed, recordRecentlyViewed } from "@/lib/recently-viewed";

beforeEach(() => {
  window.localStorage.clear();
  clearRecentlyViewed();
});

describe("RecentlyViewedChips", () => {
  it("renders nothing when zero records have been viewed", () => {
    const { container } = render(<RecentlyViewedChips />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a chip per viewed record, most-recent-first, each linking to its detail page", () => {
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });
    recordRecentlyViewed({ type: "vendor", id: "vendor-1", name: "Acme Traders" });
    recordRecentlyViewed({ type: "team-member", id: "tm-1", name: "Ravi Kumar" });

    render(<RecentlyViewedChips />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/team/tm-1");
    expect(links[0]).toHaveTextContent("Ravi Kumar");
    expect(links[0]).toHaveTextContent("Team Member");
    expect(links[1]).toHaveAttribute("href", "/vendors/vendor-1");
    expect(links[2]).toHaveAttribute("href", "/sites/site-1");
  });

  it("renders a Subcontractor chip linking to its detail page", () => {
    recordRecentlyViewed({ type: "subcontractor", id: "sub-1", name: "BuildRight Co" });

    render(<RecentlyViewedChips />);

    const link = screen.getByRole("link", { name: /BuildRight Co/ });
    expect(link).toHaveAttribute("href", "/subcontractors/sub-1");
  });
});
