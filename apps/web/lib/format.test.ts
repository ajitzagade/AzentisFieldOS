import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatMoney } from "./format";

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
  it("formats an ISO date string as DD/MMM/YYYY", () => {
    expect(formatDate("2026-08-13T00:00:00.000Z")).toBe("13/Aug/2026");
  });

  it("zero-pads a single-digit day", () => {
    expect(formatDate("2026-09-03T00:00:00.000Z")).toBe("03/Sep/2026");
  });
});

describe("formatDateTime", () => {
  it("appends the time after the DD/MMM/YYYY date", () => {
    expect(formatDateTime("2026-08-13T10:30:00.000Z")).toMatch(/^13\/Aug\/2026, \d{1,2}:\d{2}\s?(am|pm)$/i);
  });
});
