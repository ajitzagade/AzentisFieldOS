import { describe, expect, it } from "vitest";
import { rmcGradeOptions } from "./rmc-grades";

describe("rmcGradeOptions", () => {
  it("derives grade names from the RMC Category's active Materials, stripping the redundant prefix", () => {
    const grades = rmcGradeOptions([
      { name: "RMC M25", isActive: true, category: { name: "RMC" } },
      { name: "RMC M10", isActive: true, category: { name: "rmc" } },
      { name: "M40 Pumped", isActive: true, category: { name: "RMC" } },
      { name: "OPC 53 Grade Cement", isActive: true, category: { name: "Cement & Binders" } },
    ]);
    expect(grades).toEqual(["M10", "M25", "M40 Pumped"]);
  });

  it("excludes disabled Materials — a retired grade stops being offered without touching history", () => {
    const grades = rmcGradeOptions([
      { name: "RMC M15", isActive: false, category: { name: "RMC" } },
      { name: "RMC M20", isActive: true, category: { name: "RMC" } },
    ]);
    expect(grades).toEqual(["M20"]);
  });

  it("returns empty (free-text fallback) when no RMC Category exists, tolerating partial rows", () => {
    expect(rmcGradeOptions([{ name: "Cement" }])).toEqual([]);
    expect(rmcGradeOptions([])).toEqual([]);
  });

  it("sorts numerically so M10 comes before M25 and deduplicates", () => {
    const grades = rmcGradeOptions([
      { name: "RMC M25", isActive: true, category: { name: "RMC" } },
      { name: "M25", isActive: true, category: { name: "RMC" } },
      { name: "RMC M10", isActive: true, category: { name: "RMC" } },
    ]);
    expect(grades).toEqual(["M10", "M25"]);
  });
});
