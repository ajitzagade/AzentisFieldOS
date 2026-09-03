import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createSubcontractorQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createSubcontractorQuickAction: (...args: unknown[]) => createSubcontractorQuickActionMock(...args),
}));

import { SubcontractorQuickCreateModal } from "./subcontractor-quick-create-modal";

describe("SubcontractorQuickCreateModal", () => {
  beforeEach(() => {
    createSubcontractorQuickActionMock.mockReset();
  });

  it("submits the Name and calls onSuccess with { id, name } once the action resolves", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createSubcontractorQuickActionMock.mockResolvedValue({ success: true, id: "sub-1", name: "Ganesh Pipeline Works" });

    render(<SubcontractorQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Name"), "Ganesh Pipeline Works");
    await user.click(screen.getByRole("button", { name: "Create Subcontractor" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "sub-1", name: "Ganesh Pipeline Works" }));
  });

  it("surfaces a non-Owner/Admin 403 as the same formError the full form shows", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createSubcontractorQuickActionMock.mockResolvedValue({ formError: "Only an Owner/Admin can add a Subcontractor." });

    render(<SubcontractorQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Name"), "Ganesh Pipeline Works");
    await user.click(screen.getByRole("button", { name: "Create Subcontractor" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Only an Owner/Admin can add a Subcontractor."),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
