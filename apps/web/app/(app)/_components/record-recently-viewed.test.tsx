import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RecordRecentlyViewed } from "./record-recently-viewed";

const KEY = "azentisfieldos:recently-viewed";

beforeEach(() => {
  window.localStorage.clear();
});

describe("RecordRecentlyViewed", () => {
  it("records the view on mount and renders nothing", () => {
    const { container } = render(<RecordRecentlyViewed type="site" id="site-1" name="NH-48 Widening" />);

    expect(container).toBeEmptyDOMElement();
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "[]")).toEqual([
      { type: "site", id: "site-1", name: "NH-48 Widening" },
    ]);
  });

  it("re-viewing the same record moves it to front rather than duplicating it", () => {
    render(<RecordRecentlyViewed type="vendor" id="vendor-1" name="Acme Traders" />);
    render(<RecordRecentlyViewed type="site" id="site-1" name="NH-48 Widening" />);
    render(<RecordRecentlyViewed type="vendor" id="vendor-1" name="Acme Traders" />);

    const list = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    expect(list).toEqual([
      { type: "vendor", id: "vendor-1", name: "Acme Traders" },
      { type: "site", id: "site-1", name: "NH-48 Widening" },
    ]);
  });
});
