import { describe, expect, it } from "vitest";
import { addWeeks, mondayOf, weekDates } from "./week-utils";

describe("mondayOf", () => {
  it("returns the same date when already a Monday", () => {
    expect(mondayOf("2026-08-10")).toBe("2026-08-10");
  });

  it("rolls a mid-week date back to that week's Monday", () => {
    expect(mondayOf("2026-08-13")).toBe("2026-08-10"); // Thursday
  });

  it("rolls a Sunday back to the Monday six days earlier, not forward", () => {
    expect(mondayOf("2026-08-16")).toBe("2026-08-10"); // Sunday
  });
});

describe("addWeeks", () => {
  it("adds whole weeks forward and backward", () => {
    expect(addWeeks("2026-08-10", 1)).toBe("2026-08-17");
    expect(addWeeks("2026-08-10", -1)).toBe("2026-08-03");
  });
});

describe("weekDates", () => {
  it("returns exactly seven consecutive dates starting at the given Monday", () => {
    expect(weekDates("2026-08-10")).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
    ]);
  });
});
