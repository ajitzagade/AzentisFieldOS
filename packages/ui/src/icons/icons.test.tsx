import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as Icons from "./index";

// Icons that deliberately carry an inner fill="currentColor" shape (a solid
// coin dot / exclamation dot) per _shared-kit.html's literal source — every
// other icon must have no fill anywhere but the root's fill="none".
const ICONS_WITH_INNER_SOLID_FILL = new Set(["WalletIcon", "AlertTriangleIcon"]);

const iconEntries = Object.entries(Icons).filter(
  ([name, value]) => name.endsWith("Icon") && typeof value !== "undefined",
) as [string, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>][];

describe("icon set", () => {
  it("exports exactly 26 distinct icon components", () => {
    expect(iconEntries).toHaveLength(26);
  });

  it.each(iconEntries)("%s renders a 24x24 currentColor svg and forwards className", (name, Icon) => {
    const { container } = render(<Icon className="text-accent-teal-700" data-testid={name} />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("class")).toContain("text-accent-teal-700");
    expect(svg.hasAttribute("width")).toBe(false);
    expect(svg.hasAttribute("height")).toBe(false);

    const innerFillCurrentColor = svg.querySelectorAll('[fill="currentColor"]');
    if (ICONS_WITH_INNER_SOLID_FILL.has(name)) {
      expect(innerFillCurrentColor.length).toBeGreaterThan(0);
    } else {
      expect(innerFillCurrentColor.length).toBe(0);
    }
  });

  it("uses stroke-width 2 only for Plus and ChevronRight, 1.75 for every other icon", () => {
    for (const [name, Icon] of iconEntries) {
      const { container } = render(<Icon />);
      const svg = container.querySelector("svg") as SVGSVGElement;
      const expected = name === "PlusIcon" || name === "ChevronRightIcon" ? "2" : "1.75";
      expect(svg.getAttribute("stroke-width")).toBe(expected);
    }
  });
});
