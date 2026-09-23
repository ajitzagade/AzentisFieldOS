import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createDailyLabourerQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createDailyLabourerQuickAction: (...args: unknown[]) =>
    createDailyLabourerQuickActionMock(...args),
}));

import { DailyLabourerQuickCreateModal } from "./daily-labourer-quick-create-modal";

// spec-dsr-labour-dropdown: mirrors SubcontractorQuickCreateModal.test.tsx
// almost verbatim.
describe("DailyLabourerQuickCreateModal", () => {
  beforeEach(() => {
    createDailyLabourerQuickActionMock.mockReset();
  });

  it("submits Name and Category and calls onSuccess with { id, name } once the action resolves", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createDailyLabourerQuickActionMock.mockResolvedValue({
      success: true,
      id: "l1",
      name: "Ramesh",
    });

    render(
      <DailyLabourerQuickCreateModal
        open
        onOpenChange={() => {}}
        onSuccess={onSuccess}
      />,
    );

    await user.type(screen.getByLabelText("Labour Name"), "Ramesh");
    await user.selectOptions(
      screen.getByLabelText("Labour Category"),
      "Mistri",
    );
    await user.click(screen.getByRole("button", { name: "Create Labourer" }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({ id: "l1", name: "Ramesh" }),
    );
  });

  it("surfaces a server-side validation error inline, keyed to the field", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createDailyLabourerQuickActionMock.mockResolvedValue({
      errors: { category: ["Invalid category"] },
    });

    render(
      <DailyLabourerQuickCreateModal
        open
        onOpenChange={() => {}}
        onSuccess={onSuccess}
      />,
    );

    await user.type(screen.getByLabelText("Labour Name"), "Ramesh");
    await user.selectOptions(
      screen.getByLabelText("Labour Category"),
      "Mistri",
    );
    await user.click(screen.getByRole("button", { name: "Create Labourer" }));

    await waitFor(() =>
      expect(screen.getByText("Invalid category")).toBeInTheDocument(),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
