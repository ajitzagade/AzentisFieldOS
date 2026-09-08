import { cn } from "../lib/cn";

// The single sparkline implementation (AD-5) — inline SVG, single series
// only, per DESIGN.md "Sparkline (dashboard KPI trend)" (2026-09-08): a 2px
// round-cap trend line, a ~12% same-hue area wash, and a ringed end dot. No
// axes, no legend, no per-point labels — a sparkline is trend shape, not a
// chart; anything needing readable values gets a real chart. No charting
// library (AD-4's offline-first, no-external-CDN posture — same reasoning
// as bar-chart.tsx).
//
// Color is the caller's: the line/area/dot all draw in `currentColor`, so
// the caller picks the series color via a text-* class (on-navy:
// `text-sparkline-on-navy`; on light surfaces: `text-chart-teal`). The end
// dot's 2px ring should read as a gap in the line, so it strokes in the
// containing panel's own fill — settable via the `--sparkline-ring` custom
// property (e.g. Tailwind `[--sparkline-ring:var(--navy-panel)]`),
// defaulting to the light card surface.
export interface SparklineProps {
  /** The series, oldest first — the last element renders as the ringed
   * "today" dot. */
  points: number[];
  /** Sizing and color live here (`h-8 w-full text-sparkline-on-navy`) — the
   * SVG itself is a fixed small viewBox stretched to fit. */
  className?: string;
  /** A sparkline with no label is decorative (`aria-hidden`) — the KPI
   * numeral beside it carries the value. Pass a label to expose it as a
   * `role="img"` graphic instead. */
  "aria-label"?: string;
}

// Fixed drawing surface (matches the approved mockup's geometry): points
// span x 4..103 so the 2px stroke and r4 end dot stay inside the viewBox;
// y 4 (series max) down to 28 (series min), with the area wash closing at
// the bottom edge.
const VIEW_WIDTH = 110;
const VIEW_HEIGHT = 34;
const PAD_X = 4;
const Y_TOP = 4;
const Y_BOTTOM = 28;

export function Sparkline({ points, className, "aria-label": ariaLabel }: SparklineProps) {
  // No series, or a series with any non-finite value (NaN/Infinity out of a
  // malformed payload), renders nothing — never a garbage trend shape.
  if (points.length === 0 || !points.every(Number.isFinite)) {
    return null;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const flat = max === min;
  const innerWidth = VIEW_WIDTH - PAD_X * 2;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((value, index) => {
    const x = points.length > 1 ? PAD_X + index * step : VIEW_WIDTH / 2;
    // A flat series draws mid-band rather than pinned to the bottom edge.
    const y = flat ? (Y_TOP + Y_BOTTOM) / 2 : Y_BOTTOM - ((value - min) / (max - min)) * (Y_BOTTOM - Y_TOP);
    return { x, y };
  });

  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  const linePoints = coords.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaD = `M${coords.map(({ x, y }) => `${x},${y}`).join(" L")} L${last.x},${VIEW_HEIGHT - 1} L${first.x},${VIEW_HEIGHT - 1} Z`;
  // The end dot draws as a (near-)zero-length round-capped stroked path
  // rather than a <circle>: with preserveAspectRatio="none" the SVG is
  // stretched non-uniformly to fit its box, and a circle would smear into
  // an ellipse — a non-scaling stroke stays a screen-space dot (same reason
  // the polyline's 2px stroke is non-scaling). The tiny segment length is a
  // renderer-compat nudge (some engines skip a truly zero-length subpath).
  const dotD = `M${last.x} ${last.y} l0.001 0`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn("block", className)}
    >
      {coords.length > 1 ? <path d={areaD} fill="currentColor" opacity={0.12} /> : null}
      {coords.length > 1 ? (
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {/* Ring first (12px cap = 8px dot + 2px ring each side), dot on top. */}
      <path
        d={dotD}
        fill="none"
        stroke="var(--sparkline-ring, var(--surface-1))"
        strokeWidth={12}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={dotD}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
