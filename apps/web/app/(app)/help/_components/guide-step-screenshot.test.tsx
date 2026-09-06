import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuideStepScreenshot, type GuideStepCapture } from "./guide-step-screenshot";

const mobileCapture: GuideStepCapture = {
  image: "/help-screens/create-site/2.mobile.png",
  imageW: 390,
  imageH: 844,
  target: { x: 20, y: 400, w: 350, h: 44 },
};

const desktopCapture: GuideStepCapture = {
  image: "/help-screens/create-site/2.desktop.png",
  imageW: 1280,
  imageH: 800,
  target: { x: 100, y: 50, w: 200, h: 100 },
};

describe("GuideStepScreenshot", () => {
  it("positions the ring as percentages of the image, inflated 4px per side", () => {
    render(<GuideStepScreenshot entry={{ desktop: desktopCapture }} alt="Name highlighted" />);

    const img = screen.getByRole("img", { name: "Name highlighted" });
    const ring = img.parentElement!.querySelector(".help-screenshot-ring") as HTMLElement;
    expect(ring).not.toBeNull();
    // x-4=96/1280, y-4=46/800, w+8=208/1280, h+8=108/800 (jsdom
    // normalizes trailing zeros off the serialized style values)
    expect(ring.style.left).toBe("7.5%");
    expect(ring.style.top).toBe("5.75%");
    expect(ring.style.width).toBe("16.25%");
    expect(ring.style.height).toBe("13.5%");
    // The pulse/reduced-motion behavior lives in this shared theme utility
    // (packages/ui theme.css) — the component only ever applies the class.
    expect(ring).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the mobile capture below md and the desktop capture at md+", () => {
    render(<GuideStepScreenshot entry={{ mobile: mobileCapture, desktop: desktopCapture }} alt="Site highlighted" />);

    const images = screen.getAllByRole("img", { name: "Site highlighted" });
    expect(images).toHaveLength(2);
    const mobileImg = images[0]!;
    const desktopImg = images[1]!;
    expect(mobileImg).toHaveAttribute("src", mobileCapture.image);
    expect(mobileImg).toHaveAttribute("loading", "lazy");
    expect(mobileImg.closest("[data-screenshot-variant]")).toHaveClass("md:hidden");
    expect(desktopImg.closest("[data-screenshot-variant]")).toHaveClass("hidden", "md:block");
  });

  it("shows a lone capture at every width instead of hiding it behind a breakpoint", () => {
    render(<GuideStepScreenshot entry={{ mobile: mobileCapture }} alt="Only mobile" />);

    const block = screen.getByRole("img", { name: "Only mobile" }).closest("[data-screenshot-variant]");
    expect(block).not.toHaveClass("md:hidden");
    expect(block).not.toHaveClass("hidden");
  });

  it("hides the whole screenshot block when the image fails to load (stale manifest)", () => {
    render(<GuideStepScreenshot entry={{ desktop: desktopCapture }} alt="Broken" />);

    const img = screen.getByRole("img", { name: "Broken" });
    const block = img.closest("[data-screenshot-variant]") as HTMLElement;
    expect(block.hidden).toBe(false);

    fireEvent.error(img);
    expect(block.hidden).toBe(true);
  });

  it("renders nothing for an entry with no captures", () => {
    const { container } = render(<GuideStepScreenshot entry={{}} alt="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("clamps the ring to the image edge instead of a negative offset when the target sits within RING_OFFSET_PX of it", () => {
    const edgeCapture: GuideStepCapture = {
      image: "/help-screens/submit-dsr/0.mobile.png",
      imageW: 390,
      imageH: 844,
      target: { x: 2, y: 0, w: 350, h: 44 },
    };
    render(<GuideStepScreenshot entry={{ mobile: edgeCapture }} alt="Edge target" />);

    const img = screen.getByRole("img", { name: "Edge target" });
    const ring = img.parentElement!.querySelector(".help-screenshot-ring") as HTMLElement;
    // x-4=-2 and y-4=-4 would otherwise be negative percentages, pushing the
    // ring outside the overflow-hidden frame instead of hugging the edge.
    expect(ring.style.left).toBe("0%");
    expect(ring.style.top).toBe("0%");
  });

  it("treats a manifest entry with a malformed target as no capture rather than throwing", () => {
    const malformed = {
      image: "/help-screens/create-site/2.mobile.png",
      imageW: 390,
      imageH: 844,
      target: { x: 20, y: 400 }, // missing w/h — a hand-edited or corrupted manifest row
    } as unknown as GuideStepCapture;

    expect(() =>
      render(<GuideStepScreenshot entry={{ mobile: malformed }} alt="Malformed" />),
    ).not.toThrow();
    expect(screen.queryByRole("img", { name: "Malformed" })).not.toBeInTheDocument();
  });

  it("treats a manifest entry with a zero image dimension as no capture rather than dividing by zero", () => {
    const zeroDim = { ...desktopCapture, imageW: 0 };
    render(<GuideStepScreenshot entry={{ desktop: zeroDim }} alt="Zero dimension" />);
    expect(screen.queryByRole("img", { name: "Zero dimension" })).not.toBeInTheDocument();
  });

  it("still renders a valid desktop capture when the mobile capture on the same entry is malformed", () => {
    const malformedMobile = { ...mobileCapture, target: null } as unknown as GuideStepCapture;
    render(<GuideStepScreenshot entry={{ mobile: malformedMobile, desktop: desktopCapture }} alt="Mixed" />);

    expect(screen.getAllByRole("img", { name: "Mixed" })).toHaveLength(1);
  });
});
