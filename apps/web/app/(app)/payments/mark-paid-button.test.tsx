import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  markPaymentPaidAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { MarkPaidButton } from "./mark-paid-button";

describe("MarkPaidButton", () => {
  it("renders a Mark Paid submit button, distinct from a CorrectAction icon-only button", () => {
    render(<MarkPaidButton id="p1" />);

    const button = screen.getByRole("button", { name: "Mark Paid" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Mark Paid");
  });
});
