import { describe, expect, it } from "vitest";
import { parsePurchaseForm } from "./parse";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const physicalFacts = {
  vendorId: "11111111-1111-4111-8111-111111111111",
  materialSizeId: "22222222-2222-4222-8222-222222222222",
  destination: "GODOWN",
  quantity: "50",
  purchasedAt: "2026-09-01",
};

// D7: the hidden pricingShown flag is what makes pricing REQUIRED on the
// Owner's form while the Supervisor's pricing-less submission stays valid.
describe("parsePurchaseForm — pricing visibility contract", () => {
  it("accepts a Supervisor submission with no pricing fields at all", () => {
    const result = parsePurchaseForm(formData(physicalFacts));
    expect(result.success).toBe(true);
  });

  it("rejects an Owner submission (pricingShown=1) that leaves pricing blank", () => {
    const result = parsePurchaseForm(formData({ ...physicalFacts, pricingShown: "1" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.rate?.[0]).toBe("Rate is required");
      expect(errors.totalAmount?.[0]).toBe("Total Amount is required");
      expect(errors.paymentStatus?.[0]).toBe("Payment Status is required");
    }
  });

  it("accepts an Owner submission with the full pricing group", () => {
    const result = parsePurchaseForm(
      formData({ ...physicalFacts, pricingShown: "1", rate: "390", totalAmount: "19500", paymentStatus: "UNPAID" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects a partial pricing group even without the flag (schema all-or-none)", () => {
    const result = parsePurchaseForm(formData({ ...physicalFacts, rate: "390" }));
    expect(result.success).toBe(false);
  });
});
