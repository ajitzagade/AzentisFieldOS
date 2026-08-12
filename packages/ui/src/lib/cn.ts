import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// The one place class-name merging happens. Components compose classes
// through this, never string concatenation — keeps token-driven Tailwind
// classes conflict-free (AD-4).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
