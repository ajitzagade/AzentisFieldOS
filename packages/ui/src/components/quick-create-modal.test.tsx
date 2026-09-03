import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuickCreateModal, type QuickCreateFormState } from "./quick-create-modal";

function TextInput({ name, defaultValue, error }: { name: string; defaultValue?: string; error?: string }) {
  return (
    <div className="mb-4">
      <label htmlFor={name}>{name}</label>
      <input id={name} name={name} defaultValue={defaultValue} />
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

describe("QuickCreateModal", () => {
  it("calls onSuccess with { id, name } once the action resolves success", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    const action = vi.fn(
      async (): Promise<QuickCreateFormState> => ({ success: true, id: "new-id", name: "Shree Balaji Traders" }),
    );

    render(
      <QuickCreateModal
        open
        onOpenChange={onOpenChange}
        title="Add Vendor"
        action={action}
        onSuccess={onSuccess}
        submitLabel="Create Vendor"
      >
        {(errorFor) => <TextInput name="name" error={errorFor("name")} />}
      </QuickCreateModal>,
    );

    await user.type(screen.getByLabelText("name"), "Shree Balaji Traders");
    await user.click(screen.getByRole("button", { name: "Create Vendor" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: "new-id", name: "Shree Balaji Traders" });
    });
  });

  it("keeps the modal's typed values on the field when the action returns a validation error", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const action = vi.fn(
      async (): Promise<QuickCreateFormState> => ({ errors: { name: ["A Vendor with this name already exists"] } }),
    );

    render(
      <QuickCreateModal
        open
        onOpenChange={() => {}}
        title="Add Vendor"
        action={action}
        onSuccess={onSuccess}
        submitLabel="Create Vendor"
      >
        {(errorFor) => <TextInput name="name" error={errorFor("name")} />}
      </QuickCreateModal>,
    );

    const input = screen.getByLabelText("name");
    await user.type(input, "Duplicate Vendor");
    await user.click(screen.getByRole("button", { name: "Create Vendor" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("A Vendor with this name already exists");
    });
    expect(input).toHaveValue("Duplicate Vendor");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("surfaces a formError (e.g. a non-Owner's 403) instead of calling onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const action = vi.fn(
      async (): Promise<QuickCreateFormState> => ({ formError: "Only an Owner/Admin can add a Subcontractor." }),
    );

    render(
      <QuickCreateModal open onOpenChange={() => {}} title="Add Subcontractor" action={action} onSuccess={onSuccess} submitLabel="Create Subcontractor">
        {(errorFor) => <TextInput name="name" error={errorFor("name")} />}
      </QuickCreateModal>,
    );

    await user.click(screen.getByRole("button", { name: "Create Subcontractor" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Only an Owner/Admin can add a Subcontractor.");
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
