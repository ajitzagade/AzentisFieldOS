import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@azentisfieldos/ui";

vi.mock("./actions", () => ({
  markPaymentPaidAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { MarkPaidButton } from "./mark-paid-button";

function renderButton() {
  return render(
    <ToastProvider>
      <MarkPaidButton id="p1" />
    </ToastProvider>,
  );
}

describe("MarkPaidButton", () => {
  it("renders a Mark Paid submit button, distinct from a CorrectAction icon-only button", () => {
    renderButton();

    const button = screen.getByRole("button", { name: "Mark Paid" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Mark Paid");
  });

  it("asks for confirmation before submitting — pending → paid is one-directional", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Mark Paid" }));

    expect(await screen.findByText("Mark this Payment as paid?")).toBeInTheDocument();
    expect(screen.getByText(/cannot be set back to pending/)).toBeInTheDocument();
  });
});
