import { describe, expect, it } from "vitest";
import { parseCorrectVendorAdvanceForm } from "./parse";

function formDataFrom(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseCorrectVendorAdvanceForm", () => {
  const valid = {
    correctsId: "11111111-1111-4111-8111-111111111111",
    amount: "-500",
    reason: "Amount was overstated",
  };

  it("accepts a valid correction submission", () => {
    const result = parseCorrectVendorAdvanceForm(formDataFrom(valid));
    expect(result.success).toBe(true);
  });

  it("rejects a zero amount delta", () => {
    const result = parseCorrectVendorAdvanceForm(formDataFrom({ ...valid, amount: "0" }));
    expect(result.success).toBe(false);
  });

  it("rejects a missing reason", () => {
    const data = formDataFrom(valid);
    data.delete("reason");
    const result = parseCorrectVendorAdvanceForm(data);
    expect(result.success).toBe(false);
  });

  it("rejects a missing correctsId — this schema is correction-only", () => {
    const data = formDataFrom(valid);
    data.delete("correctsId");
    const result = parseCorrectVendorAdvanceForm(data);
    expect(result.success).toBe(false);
  });

  it("parses an omitted paymentMethod as undefined, not an empty string", () => {
    const result = parseCorrectVendorAdvanceForm(formDataFrom(valid));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentMethod).toBeUndefined();
    }
  });
});
