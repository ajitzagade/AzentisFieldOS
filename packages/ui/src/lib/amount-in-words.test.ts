import { describe, expect, it } from "vitest";
import { amountInWords } from "./amount-in-words";

describe("amountInWords (Indian numbering)", () => {
  it.each([
    [0, "Zero Rupees"],
    [1, "One Rupee"],
    [21, "Twenty-One Rupees"],
    [500, "Five Hundred Rupees"],
    [1250, "One Thousand Two Hundred Fifty Rupees"],
    [100000, "One Lakh Rupees"],
    [125000, "One Lakh Twenty-Five Thousand Rupees"],
    [10000000, "One Crore Rupees"],
    [12345678, "One Crore Twenty-Three Lakh Forty-Five Thousand Six Hundred Seventy-Eight Rupees"],
  ] as const)("%s → %s", (input, expected) => {
    expect(amountInWords(input)).toBe(expected);
  });

  it("reads paise", () => {
    expect(amountInWords(12.5)).toBe("Twelve Rupees and Fifty Paise");
    expect(amountInWords(0.75)).toBe("Seventy-Five Paise");
  });

  it("reads a negative correction delta as Minus", () => {
    expect(amountInWords(-400)).toBe("Minus Four Hundred Rupees");
  });

  it("accepts numeric strings and returns empty for junk", () => {
    expect(amountInWords("1250")).toBe("One Thousand Two Hundred Fifty Rupees");
    expect(amountInWords("not-a-number")).toBe("");
    expect(amountInWords("")).toBe("");
  });
});
