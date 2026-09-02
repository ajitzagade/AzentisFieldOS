import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuickAddSheet, type QuickAddItem } from "./quick-add-sheet";

const ITEMS: QuickAddItem[] = [
  { id: "new-daily-report", title: "New Daily Report", description: "Start today's Daily Report", icon: <span data-testid="dr-icon" /> },
  { id: "record-advance", title: "Record Advance", description: "Give a Team Member an advance" },
];

function Harness(props: Partial<React.ComponentProps<typeof QuickAddSheet>>) {
  const [open, setOpen] = useState(true);
  return (
    <QuickAddSheet open={open} onOpenChange={setOpen} items={ITEMS} onSelect={vi.fn()} {...props} />
  );
}

describe("QuickAddSheet", () => {
  it("renders every curated item's title and description", async () => {
    render(<Harness />);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("New Daily Report")).toBeInTheDocument();
    expect(screen.getByText("Start today's Daily Report")).toBeInTheDocument();
    expect(screen.getByText("Record Advance")).toBeInTheDocument();
    expect(screen.getByText("Give a Team Member an advance")).toBeInTheDocument();
  });

  it("renders a solid icon tile only for items with an icon", async () => {
    render(<Harness />);

    const tile = (await screen.findByTestId("dr-icon")).parentElement;
    expect(tile).toHaveClass("bg-accent-teal-700");
    expect(tile).toHaveClass("rounded-full");
  });

  it("calls onSelect with the item's id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);

    await user.click(await screen.findByText("Record Advance"));

    expect(onSelect).toHaveBeenCalledWith("record-advance");
  });

  it("defaults the dialog title to 'Quick Add' but accepts an override", async () => {
    render(<Harness />);
    expect(await screen.findByText("Quick Add")).toBeInTheDocument();
  });

  it("renders nothing (no dialog) while closed", () => {
    render(<Harness open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
