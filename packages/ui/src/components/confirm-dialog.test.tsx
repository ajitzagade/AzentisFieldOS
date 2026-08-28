import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, ConfirmDialogRow, useSubmitConfirmation } from "./confirm-dialog";

function GuardedForm({ onRealSubmit }: { onRealSubmit: () => void }) {
  const confirmation = useSubmitConfirmation();
  const [amount] = useState("500");
  return (
    <>
      <form
        onSubmit={confirmation.guard((event) => {
          event.preventDefault();
          onRealSubmit();
        })}
      >
        <button type="submit">Record Payment</button>
      </form>
      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title="Record this Payment?"
        description="Please re-verify the entered details."
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Amount" value={`₹${amount}`} />
      </ConfirmDialog>
    </>
  );
}

describe("ConfirmDialog + useSubmitConfirmation", () => {
  it("holds the submission, shows the entered details, and submits only after Confirm", async () => {
    const user = userEvent.setup();
    const onRealSubmit = vi.fn();
    render(<GuardedForm onRealSubmit={onRealSubmit} />);

    await user.click(screen.getByRole("button", { name: "Record Payment" }));

    expect(onRealSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Record this Payment?")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm & Submit" }));
    await waitFor(() => expect(onRealSubmit).toHaveBeenCalledTimes(1));
  });

  it("cancelling closes the dialog without submitting, and the next submit asks again", async () => {
    const user = userEvent.setup();
    const onRealSubmit = vi.fn();
    render(<GuardedForm onRealSubmit={onRealSubmit} />);

    await user.click(screen.getByRole("button", { name: "Record Payment" }));
    await user.click(await screen.findByRole("button", { name: "Go back" }));

    expect(onRealSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Record this Payment?")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Record Payment" }));
    expect(await screen.findByText("Record this Payment?")).toBeInTheDocument();
    expect(onRealSubmit).not.toHaveBeenCalled();
  });
});
