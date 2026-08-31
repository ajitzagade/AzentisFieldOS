import { describe, expect, it } from "vitest";
import { NAV_GROUPS } from "./nav-config";

describe("NAV_GROUPS", () => {
  it("gives every item within a group its own distinct icon, so visually adjacent items are never confused for each other", () => {
    for (const group of NAV_GROUPS) {
      const icons = group.items.map((item) => item.icon);
      expect(new Set(icons).size).toBe(icons.length);
    }
  });
});
