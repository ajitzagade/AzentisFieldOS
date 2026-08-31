import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("shows the current range and total", () => {
    render(<Pagination page={2} pageSize={25} total={120} onPageChange={vi.fn()} />);
    expect(screen.getByText("Showing 26–50 of 120")).toBeInTheDocument();
  });

  it("caps the shown range at the total on the last page", () => {
    render(<Pagination page={5} pageSize={25} total={110} onPageChange={vi.fn()} />);
    expect(screen.getByText("Showing 101–110 of 110")).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    render(<Pagination page={1} pageSize={25} total={100} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("disables Next on the last page", () => {
    render(<Pagination page={4} pageSize={25} total={100} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("calls onPageChange with page - 1 / page + 1 when Previous/Next are clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={25} total={100} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("renders nothing when every row already fits on one page", () => {
    const { container } = render(<Pagination page={1} pageSize={25} total={10} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
