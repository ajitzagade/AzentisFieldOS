import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createSiteQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createSiteQuickAction: (...args: unknown[]) => createSiteQuickActionMock(...args),
}));

import { SiteQuickCreateModal } from "./site-quick-create-modal";

describe("SiteQuickCreateModal", () => {
  beforeEach(() => {
    createSiteQuickActionMock.mockReset();
  });

  it("submits Name and Location and calls onSuccess with { id, name } once the action resolves", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createSiteQuickActionMock.mockResolvedValue({ success: true, id: "site-1", name: "NH-48 Widening" });

    render(<SiteQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Name"), "NH-48 Widening");
    await user.type(screen.getByLabelText("Location"), "Nashik");
    await user.click(screen.getByRole("button", { name: "Create Site" }));

    await waitFor(() => expect(createSiteQuickActionMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "site-1", name: "NH-48 Widening" }));
  });

  it("keeps typed values and shows the inline error when the action returns a validation error", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createSiteQuickActionMock.mockResolvedValue({ errors: { name: ["A Site with this name already exists"] } });

    render(<SiteQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    const input = screen.getByLabelText("Name");
    await user.type(input, "Duplicate Site");
    await user.type(screen.getByLabelText("Location"), "Nashik");
    await user.click(screen.getByRole("button", { name: "Create Site" }));

    await waitFor(() => expect(screen.getByText("A Site with this name already exists")).toBeInTheDocument());
    expect(input).toHaveValue("Duplicate Site");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("folds contract reference/description behind a details disclosure and omits Status", () => {
    render(<SiteQuickCreateModal open onOpenChange={() => {}} onSuccess={() => {}} />);

    expect(screen.getByText(/more details/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Contract reference")).toBeInTheDocument();
    expect(screen.queryByLabelText("Status")).not.toBeInTheDocument();
  });
});
