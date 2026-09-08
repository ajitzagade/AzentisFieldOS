import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./sparkline";

// The dot is the last path (currentColor), the ring the one before it.
function dotPaths(container: HTMLElement) {
  const paths = Array.from(container.querySelectorAll("path"));
  return { ring: paths[paths.length - 2], dot: paths[paths.length - 1] };
}

describe("Sparkline", () => {
  it("renders a single-series line, area wash, and ringed end dot in currentColor", () => {
    const { container } = render(<Sparkline points={[4, 4, 3, 4, 4, 2, 3]} />);

    const polyline = container.querySelector("polyline");
    expect(polyline).not.toBeNull();
    expect(polyline).toHaveAttribute("stroke", "currentColor");
    expect(polyline).toHaveAttribute("stroke-width", "2");
    expect(polyline).toHaveAttribute("stroke-linecap", "round");
    // The viewBox is stretched non-uniformly (preserveAspectRatio="none") —
    // the stroke must stay 2px in screen space.
    expect(polyline).toHaveAttribute("vector-effect", "non-scaling-stroke");

    // ~12% same-hue area wash, no separate series color.
    const area = container.querySelector("path");
    expect(area).toHaveAttribute("fill", "currentColor");
    expect(area).toHaveAttribute("opacity", "0.12");

    // Today's point: a screen-space round-cap stroked dot over a ring in
    // the panel's own fill — not a <circle>, which would stretch into an
    // ellipse under the non-uniform scale.
    expect(container.querySelector("circle")).toBeNull();
    const { ring, dot } = dotPaths(container);
    expect(ring?.getAttribute("stroke")).toContain("--sparkline-ring");
    expect(ring).toHaveAttribute("stroke-width", "12");
    expect(ring).toHaveAttribute("vector-effect", "non-scaling-stroke");
    expect(dot).toHaveAttribute("stroke", "currentColor");
    expect(dot).toHaveAttribute("stroke-width", "8");
    expect(dot).toHaveAttribute("stroke-linecap", "round");
    expect(dot).toHaveAttribute("vector-effect", "non-scaling-stroke");
  });

  it("is aria-hidden when unlabeled — the KPI numeral carries the value", () => {
    const { container } = render(<Sparkline points={[1, 2, 3]} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("exposes a role=img graphic when given an aria-label", () => {
    const { container } = render(
      <Sparkline points={[1, 2, 3]} aria-label="Sites reporting, last 7 days" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Sites reporting, last 7 days");
    expect(svg).not.toHaveAttribute("aria-hidden");
  });

  it("renders nothing for an empty series", () => {
    const { container } = render(<Sparkline points={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when any point is non-finite (malformed payload)", () => {
    for (const bad of [
      [1, Number.NaN, 3],
      [1, Number.POSITIVE_INFINITY, 3],
    ]) {
      const { container } = render(<Sparkline points={bad} />);
      expect(container.firstChild).toBeNull();
    }
  });

  it("renders only the end dot — no line, no area — for a single point", () => {
    const { container } = render(<Sparkline points={[5]} />);
    expect(container.querySelector("polyline")).toBeNull();
    // Just the ring + dot paths, no degenerate area path.
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });

  it("draws a flat series mid-band instead of pinned to an edge", () => {
    const { container } = render(<Sparkline points={[5, 5, 5]} />);
    const polyline = container.querySelector("polyline");
    // All y coordinates equal and strictly inside the 4..28 band.
    const ys = polyline!
      .getAttribute("points")!
      .split(" ")
      .map((pair) => Number(pair.split(",")[1]));
    expect(new Set(ys).size).toBe(1);
    expect(ys[0]).toBeGreaterThan(4);
    expect(ys[0]).toBeLessThan(28);
  });
});
