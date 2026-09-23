import { describe, expect, it } from "vitest";
import { addWeeks, sundayOf, weekDates } from "./week-utils";

describe("sundayOf", () => {
  it("returns the same date when already a Sunday", () => {
    expect(sundayOf("2026-08-09")).toBe("2026-08-09");
  });

  it("rolls a mid-week date back to that week's Sunday", () => {
    expect(sundayOf("2026-08-13")).toBe("2026-08-09"); // Thursday
  });

  it("rolls a Saturday back to the Sunday six days earlier, not forward", () => {
    expect(sundayOf("2026-08-15")).toBe("2026-08-09"); // Saturday
  });
});

describe("addWeeks", () => {
  it("adds whole weeks forward and backward", () => {
    expect(addWeeks("2026-08-09", 1)).toBe("2026-08-16");
    expect(addWeeks("2026-08-09", -1)).toBe("2026-08-02");
  });
});

describe("weekDates", () => {
  it("returns exactly seven consecutive dates starting at the given Sunday", () => {
    expect(weekDates("2026-08-09")).toEqual([
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
    ]);
  });
});
