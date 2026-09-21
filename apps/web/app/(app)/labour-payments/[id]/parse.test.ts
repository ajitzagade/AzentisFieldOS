import { describe, expect, it } from "vitest";
import { parseCreateAttendanceForm, parseCreateWeeklyPaymentForm } from "./parse";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const baseAttendance = {
  labourerId: "11111111-1111-4111-8111-111111111111",
  siteId: "22222222-2222-4222-8222-222222222222",
  workDate: "2026-08-10",
  attended: "1",
  perDayAmount: "800",
};

describe("parseCreateAttendanceForm", () => {
  it("accepts a plain attendance entry with no advance", () => {
    const result = parseCreateAttendanceForm(formData(baseAttendance));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.advance).toBeUndefined();
    }
  });

  it("nests amount/description under advance only when the checkbox is on", () => {
    const result = parseCreateAttendanceForm(
      formData({ ...baseAttendance, advanceGiven: "1", advanceAmount: "500", advanceDescription: "Medical" }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.advance).toEqual({ amount: 500, description: "Medical" });
    }
  });

  it("ignores stray advanceAmount fields when the checkbox is off", () => {
    const result = parseCreateAttendanceForm(formData({ ...baseAttendance, advanceAmount: "500" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.advance).toBeUndefined();
    }
  });
});

const baseWeeklyPayment = {
  labourerId: "11111111-1111-4111-8111-111111111111",
  weekStartDate: "2026-08-10",
  amountPaid: "2400",
  status: "PAID",
};

describe("parseCreateWeeklyPaymentForm", () => {
  it("accepts a payment with no advance adjustment", () => {
    const result = parseCreateWeeklyPaymentForm(formData(baseWeeklyPayment));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.advanceAdjustment).toBeUndefined();
    }
  });

  it("nests advanceId/amount/note under advanceAdjustment when an amount is entered", () => {
    const result = parseCreateWeeklyPaymentForm(
      formData({
        ...baseWeeklyPayment,
        adjustAdvanceId: "33333333-3333-4333-8333-333333333333",
        adjustAmount: "300",
        adjustNote: "Partial repay",
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.advanceAdjustment).toEqual({
        advanceId: "33333333-3333-4333-8333-333333333333",
        amount: 300,
        note: "Partial repay",
      });
    }
  });

  it("rejects a weekStartDate that is not a Monday", () => {
    const result = parseCreateWeeklyPaymentForm(formData({ ...baseWeeklyPayment, weekStartDate: "2026-08-11" }));
    expect(result.success).toBe(false);
  });
});
