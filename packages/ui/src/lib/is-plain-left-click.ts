import { type MouseEvent } from "react";

// Shared by DataTable's row-click interception and any other href-based
// element that wants to run a side effect on a normal click while still
// leaving modifier-click/middle-click (new tab, etc.) to the browser's
// default `<a>`/`Link` behavior untouched.
export function isPlainLeftClick(event: MouseEvent<HTMLElement>): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  return true;
}
