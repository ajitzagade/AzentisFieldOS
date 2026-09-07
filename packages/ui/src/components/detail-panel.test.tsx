import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DetailPanel, type DetailPanelProps } from "./detail-panel";

function Harness(props: Partial<DetailPanelProps>) {
  const [open, setOpen] = useState(true);
  return (
    <DetailPanel open={open} onOpenChange={setOpen} title="Acme Cement Suppliers" {...props}>
      <p>Contact person: Ravi Kumar</p>
    </DetailPanel>
  );
}

describe("DetailPanel", () => {
  it("renders the title and children while open", async () => {
    render(<Harness />);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Acme Cement Suppliers")).toBeInTheDocument();
    expect(screen.getByText("Contact person: Ravi Kumar")).toBeInTheDocument();
  });

  it("renders nothing (no dialog) while closed", () => {
    render(<Harness open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalled();
    // Base UI's Dialog passes a second (event details) argument alongside
    // the boolean — assert only the open flag, matching the pattern already
    // established in advance-quick-entry-modal.test.tsx.
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it("closes on backdrop click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await screen.findByRole("dialog");
    // Base UI renders the backdrop as a sibling of the popup inside the
    // portal (outside RTL's `container`) — query the whole document for the
    // element carrying the fixed inset-0 backdrop class.
    const backdropEl = document.querySelector(".fixed.inset-0.z-50.bg-ink-900\\/50");
    expect(backdropEl).not.toBeNull();
    await user.click(backdropEl as Element);

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Close panel" }));

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });
});
