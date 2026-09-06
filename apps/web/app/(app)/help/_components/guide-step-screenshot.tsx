"use client";

// Annotated guide-step screenshot (EXPERIENCE.md "Guide screenshot
// pipeline" + DESIGN.md "Screenshot annotation", 2026-09-06): a real,
// script-captured screenshot of the step's screen with a pulsing
// accent-teal-700 ring over the one field/button the step is about. The
// ring is a DOM overlay positioned by percentages of the capture's image
// size — never baked into the PNG — so it scales with the responsive
// display width. Mobile vs desktop capture selection is pure CSS by
// breakpoint (`md:` classes), matching the reader's own device with no
// manual toggle.
//
// Client component (for the <img> onError fallback below) but hook-free —
// everything is derived from props.

export interface GuideStepCaptureRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GuideStepCapture {
  /** Public URL of the committed PNG, e.g. /help-screens/create-site/2.mobile.png */
  image: string;
  /** Capture viewport CSS px — the coordinate space `target` is recorded in. */
  imageW: number;
  imageH: number;
  /** The ringed element's bounding box in capture-viewport CSS px. */
  target: GuideStepCaptureRect;
}

export interface GuideStepScreenshotEntry {
  /** The step's title at the time this entry was captured — used by the
   * guide page to detect drift against the live guide content and fall
   * back to text-only rather than pair a stale screenshot with a caption
   * that no longer describes it. */
  stepTitle?: string;
  mobile?: GuideStepCapture;
  desktop?: GuideStepCapture;
}

/** Shape of the committed help-screens.manifest.json: guideId → stepIndex
 * (stringified, 0-based) → per-viewport capture. Generated only by
 * `pnpm help:screens` (e2e/help-screens/) — never hand-edited. */
export type HelpScreensManifest = Record<string, Record<string, GuideStepScreenshotEntry> | undefined>;

/** DESIGN.md: the ring sits 4px outside the target element's own edge. */
const RING_OFFSET_PX = 4;

// The manifest is a committed artifact this component trusts by convention
// ("never hand-edited"), but it's still an untyped JSON import at runtime —
// a corrupted or manually-edited entry must degrade the ring, never throw
// and take the whole guide page down with it.
function isValidCapture(capture: unknown): capture is GuideStepCapture {
  if (!capture || typeof capture !== "object") return false;
  const c = capture as Partial<GuideStepCapture>;
  if (
    typeof c.image !== "string" ||
    typeof c.imageW !== "number" ||
    c.imageW <= 0 ||
    typeof c.imageH !== "number" ||
    c.imageH <= 0 ||
    typeof c.target !== "object" ||
    c.target === null
  ) {
    return false;
  }
  const target = c.target as unknown as Record<string, unknown>;
  return (["x", "y", "w", "h"] as const).every((k) => typeof target[k] === "number");
}

function ringStyle(capture: GuideStepCapture) {
  const { x, y, w, h } = capture.target;
  // Clamp to [0, 100]: a target within RING_OFFSET_PX of the image's edge
  // would otherwise produce a negative left/top, pushing the ring outside
  // the `overflow-hidden` frame instead of hugging the edge it's already at.
  const pct = (value: number, total: number) => `${Math.min(100, Math.max(0, (value / total) * 100)).toFixed(4)}%`;
  return {
    left: pct(x - RING_OFFSET_PX, capture.imageW),
    top: pct(y - RING_OFFSET_PX, capture.imageH),
    width: pct(w + 2 * RING_OFFSET_PX, capture.imageW),
    height: pct(h + 2 * RING_OFFSET_PX, capture.imageH),
  };
}

// A manifest entry whose PNG is missing must degrade to the text-only step,
// never a broken-image icon: onError hides this variant's whole block. DOM
// attribute toggle, not state — no hooks needed for a one-way fallback.
function hideOnError(event: { currentTarget: HTMLImageElement }) {
  const block = event.currentTarget.closest("[data-screenshot-variant]");
  if (block instanceof HTMLElement) block.hidden = true;
}

function ScreenshotVariant({
  capture,
  alt,
  className,
}: {
  capture: GuideStepCapture;
  alt: string;
  className: string;
}) {
  return (
    <div data-screenshot-variant className={className}>
      <div className="relative inline-block max-w-full overflow-hidden rounded-md border border-border-hairline">
        {/* Plain lazy <img> by repo convention (no next/image). width/height
            reserve the intrinsic box (no layout shift); max-w-full prevents
            any horizontal overflow. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- committed
            capture-pipeline artifact served from /public, deliberately a
            plain lazy-loaded <img> per the guide-screenshot spec. */}
        <img
          src={capture.image}
          alt={alt}
          loading="lazy"
          width={capture.imageW}
          height={capture.imageH}
          onError={hideOnError}
          className="block h-auto max-w-full"
        />
        <div
          aria-hidden="true"
          className="help-screenshot-ring"
          // Data-driven geometry from the capture manifest (percentages of
          // the image box) — same precedent as bar-chart.tsx's width%; the
          // ring's visual styling itself comes from the theme utility (AD-4).
          style={ringStyle(capture)}
        />
      </div>
    </div>
  );
}

export function GuideStepScreenshot({ entry, alt }: { entry: GuideStepScreenshotEntry; alt: string }) {
  const mobile = isValidCapture(entry.mobile) ? entry.mobile : undefined;
  const desktop = isValidCapture(entry.desktop) ? entry.desktop : undefined;
  if (!mobile && !desktop) return null;
  return (
    <div className="mt-3">
      {/* The reader sees whichever capture matches their own viewport:
          mobile below `md`, desktop at `md`+. When only one capture exists
          it is shown at every width rather than hiding the step's shot. */}
      {mobile ? <ScreenshotVariant capture={mobile} alt={alt} className={desktop ? "md:hidden" : ""} /> : null}
      {desktop ? <ScreenshotVariant capture={desktop} alt={alt} className={mobile ? "hidden md:block" : ""} /> : null}
    </div>
  );
}
