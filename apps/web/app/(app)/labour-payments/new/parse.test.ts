import { describe, expect, it } from "vitest";
import { parseCreateDailyLabourerForm } from "./parse";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const baseLabourer = {
  name: "Ramesh Kumar",
  category: "Mistri",
};

describe("parseCreateDailyLabourerForm", () => {
  it.each(["Men", "Women", "Mistri"])("accepts the fixed category %s", (category) => {
    const result = parseCreateDailyLabourerForm(formData({ ...baseLabourer, category }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe(category);
    }
  });

  it("rejects an old-style free-text category (e.g. Mason)", () => {
    const result = parseCreateDailyLabourerForm(formData({ ...baseLabourer, category: "Mason" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty category", () => {
    const result = parseCreateDailyLabourerForm(formData({ ...baseLabourer, category: "" }));
    expect(result.success).toBe(false);
  });

  it("accepts an optional defaultPerDayAmount", () => {
    const result = parseCreateDailyLabourerForm(formData({ ...baseLabourer, defaultPerDayAmount: "800" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPerDayAmount).toBe(800);
    }
  });

  it("leaves defaultPerDayAmount undefined when omitted", () => {
    const result = parseCreateDailyLabourerForm(formData(baseLabourer));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPerDayAmount).toBeUndefined();
    }
  });
});
