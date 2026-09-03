import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const referenceFetchMock = vi.fn();
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => referenceFetchMock,
}));

const createMaterialQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createMaterialQuickAction: (...args: unknown[]) => createMaterialQuickActionMock(...args),
}));

import { MaterialQuickCreateModal } from "./material-quick-create-modal";

function mockReferenceLists(categories: unknown[], units: unknown[]) {
  referenceFetchMock.mockImplementation((path: string) => {
    if (path === "/material-categories") return Promise.resolve({ ok: true, json: async () => categories });
    if (path === "/units") return Promise.resolve({ ok: true, json: async () => units });
    throw new Error(`Unexpected path ${path}`);
  });
}

describe("MaterialQuickCreateModal", () => {
  beforeEach(() => {
    referenceFetchMock.mockReset();
    createMaterialQuickActionMock.mockReset();
  });

  it("fetches Categories/Units only once opened, and submits Name + Category + Unit", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockReferenceLists(
      [{ id: "11111111-1111-4111-8111-111111111111", name: "Cement", isActive: true }],
      [{ id: "22222222-2222-4222-8222-222222222222", name: "Bags" }],
    );
    createMaterialQuickActionMock.mockResolvedValue({ success: true, id: "size-1", name: "OPC 53 Cement — 50kg" });

    render(<MaterialQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Name"), "OPC 53 Cement");
    await user.type(screen.getByLabelText("Size / Specification"), "50kg");
    await user.type(await screen.findByLabelText("Category"), "Cem");
    await user.click(await screen.findByText("Cement"));
    await user.type(screen.getByLabelText("Unit"), "Bag");
    await user.click(await screen.findByText("Bags"));
    await user.click(screen.getByRole("button", { name: "Create Material" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "size-1", name: "OPC 53 Cement — 50kg" }));
  });

  it("shows 'create one first' guidance in place of the Category picker when none exist", async () => {
    mockReferenceLists([], [{ id: "22222222-2222-4222-8222-222222222222", name: "Bags" }]);

    render(<MaterialQuickCreateModal open onOpenChange={() => {}} onSuccess={() => {}} />);

    expect(await screen.findByText(/No Categories yet/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
  });
});
