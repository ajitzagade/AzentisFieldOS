import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToastProvider, Toaster, useToast } from "./toast";

function Fixture() {
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => toast.success("Payment recorded")}>
        fire success
      </button>
      <button type="button" onClick={() => toast.error("Could not save")}>
        fire error
      </button>
      <Toaster />
    </>
  );
}

describe("Toast system", () => {
  it("shows a success toast with its message", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Fixture />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "fire success" }));
    // Base UI mirrors the message into an aria-live region — assert at
    // least one visible instance rather than exactly one node.
    expect((await screen.findAllByText("Payment recorded")).length).toBeGreaterThan(0);
  });

  it("shows an error toast and can be dismissed", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Fixture />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "fire error" }));
    expect((await screen.findAllByText("Could not save")).length).toBeGreaterThan(0);

    // Base UI keeps the close affordance out of the a11y tree until the
    // viewport is hovered/expanded — reach it directly.
    const close = document.querySelector('[aria-label="Dismiss notification"]');
    expect(close).not.toBeNull();
    fireEvent.click(close!);
    await waitFor(() => expect(screen.queryAllByText("Could not save")).toHaveLength(0));
  });
});
