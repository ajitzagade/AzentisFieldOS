import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createVendorQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createVendorQuickAction: (...args: unknown[]) => createVendorQuickActionMock(...args),
}));

import { VendorQuickCreateModal } from "./vendor-quick-create-modal";

describe("VendorQuickCreateModal", () => {
  beforeEach(() => {
    createVendorQuickActionMock.mockReset();
  });

  it("submits the Name and calls onSuccess with { id, name } once the action resolves", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createVendorQuickActionMock.mockResolvedValue({ success: true, id: "vendor-1", name: "Shree Balaji Traders" });

    render(<VendorQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Name"), "Shree Balaji Traders");
    await user.click(screen.getByRole("button", { name: "Create Vendor" }));

    await waitFor(() => expect(createVendorQuickActionMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "vendor-1", name: "Shree Balaji Traders" }));
  });

  it("keeps typed values and shows the inline error when the action returns a validation error", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createVendorQuickActionMock.mockResolvedValue({ errors: { name: ["A Vendor with this name already exists"] } });

    render(<VendorQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    const input = screen.getByLabelText("Name");
    await user.type(input, "Duplicate Vendor");
    await user.click(screen.getByRole("button", { name: "Create Vendor" }));

    await waitFor(() => expect(screen.getByText("A Vendor with this name already exists")).toBeInTheDocument());
    expect(input).toHaveValue("Duplicate Vendor");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("folds contact/phone/email/address behind a details disclosure", () => {
    render(<VendorQuickCreateModal open onOpenChange={() => {}} onSuccess={() => {}} />);

    // Collapsed <details> fields stay in the DOM (still submit) but sit
    // behind the summary toggle rather than the required Name field.
    expect(screen.getByText(/more details/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
  });
});
