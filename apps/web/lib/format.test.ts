import { describe, expect, it } from "vitest";
import { formatDate, formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats a positive amount with the rupee sign and Indian digit grouping", () => {
    expect(formatMoney(186400)).toBe("₹1,86,400");
  });

  it("formats a negative amount with a leading minus outside the rupee sign", () => {
    expect(formatMoney(-500)).toBe("−₹500");
  });

  it("formats zero without a sign", () => {
    expect(formatMoney(0)).toBe("₹0");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string as day-month-year, Indian style", () => {
    expect(formatDate("2026-08-13T00:00:00.000Z")).toMatch(/13 Aug 2026/);
  });
});
