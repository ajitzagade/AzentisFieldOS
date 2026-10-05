import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteMovementEntryButton } from "./delete-movement-entry-button";

describe("DeleteMovementEntryButton", () => {
  it("renders as an icon-only ghost trigger with an accessible name", () => {
    render(
      <DeleteMovementEntryButton
        icon={<svg data-testid="delete-icon" />}
        title="Delete this Purchase?"
        action={vi.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("bg-transparent");
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
  });

  it("opens a confirmation dialog with a required reason field, not a bare confirm", async () => {
    const user = userEvent.setup();
    render(
      <DeleteMovementEntryButton
        icon={<svg />}
        title="Delete this Purchase?"
        description="This Purchase will disappear from every list."
        action={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Delete this Purchase?")).toBeInTheDocument();
    expect(screen.getByText("This Purchase will disappear from every list.")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for deletion")).toBeRequired();
  });

  // The AD-9 exception's whole point is that a delete always carries a
  // reason — the confirm button must not be clickable with an empty one.
  it("disables the confirm button until a reason is typed", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteMovementEntryButton icon={<svg />} title="Delete this Purchase?" action={action} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const confirmButtons = screen.getAllByRole("button", { name: "Delete" });
    const confirmButton = confirmButtons[confirmButtons.length - 1]!;
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText("Reason for deletion"), "Entered twice by mistake");
    expect(confirmButton).not.toBeDisabled();
  });

  it("calls action with the typed, trimmed reason once confirmed", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteMovementEntryButton icon={<svg />} title="Delete this Purchase?" action={action} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.type(screen.getByLabelText("Reason for deletion"), "Entered twice by mistake");
    const confirmButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(confirmButtons[confirmButtons.length - 1]!);

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith("Entered twice by mistake");
    });
  });
});
