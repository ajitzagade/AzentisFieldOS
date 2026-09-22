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

// D7 (widened 2026-09-22): pricing is optional for both the Supervisor's
// and the Owner's form — neither is forced to price a Purchase at entry
// time. totalAmount/paymentStatus still travel together as a group.
describe("parsePurchaseForm — pricing is always optional", () => {
  it("accepts a submission with no pricing fields at all", () => {
    const result = parsePurchaseForm(formData(physicalFacts));
    expect(result.success).toBe(true);
  });

  it("accepts an Owner submission with the full pricing group", () => {
    const result = parsePurchaseForm(
      formData({ ...physicalFacts, rate: "390", totalAmount: "19500", paymentStatus: "UNPAID" }),
    );
    expect(result.success).toBe(true);
  });

  it("accepts an Owner submission with totalAmount/paymentStatus but no rate", () => {
    const result = parsePurchaseForm(formData({ ...physicalFacts, totalAmount: "19500", paymentStatus: "UNPAID" }));
    expect(result.success).toBe(true);
  });

  it("accepts rate alone (rate is independently optional)", () => {
    const result = parsePurchaseForm(formData({ ...physicalFacts, rate: "390" }));
    expect(result.success).toBe(true);
  });

  it("rejects a partial totalAmount/paymentStatus group (schema all-or-none)", () => {
    const result = parsePurchaseForm(formData({ ...physicalFacts, totalAmount: "19500" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.paymentStatus?.[0]).toBeTruthy();
    }
  });
});
