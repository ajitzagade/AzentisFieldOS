import { forwardRef, type ReactNode, type SVGProps } from "react";

// Shared factory behind every icon in this directory (AD-5's "one
// implementation" principle applied to icons) — each icon file still
// exports its own named forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>
// component, this just removes the boilerplate common to all of them.
// No icon file may set a fixed width/height or a hardcoded color: props
// spread after the fixed attributes so a caller can size via className,
// and `stroke="currentColor"` is the only color-related attribute, so
// color always inherits from the container.
export function createIcon(displayName: string, children: ReactNode, strokeWidth: 1.75 | 2 = 1.75) {
  const Icon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  ));
  Icon.displayName = displayName;
  return Icon;
}
