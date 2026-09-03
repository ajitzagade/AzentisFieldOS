import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdvanceQuickEntryModal, type AdvanceQuickEntryFormState } from "./advance-quick-entry-modal";

const teamMembers = [
  { id: "tm-1", name: "Ramesh Kumar" },
  { id: "tm-2", name: "Sita Devi" },
];

async function selectTeamMember(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(screen.getByLabelText("Team Member"), name);
  await user.click(await screen.findByText(name));
}

describe("AdvanceQuickEntryModal", () => {
  it("shows a searchable Team Member combobox, amount field, and reason field when open", () => {
    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={vi.fn()}
        teamMembers={teamMembers}
        action={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Team Member")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record advance/i })).toBeInTheDocument();
  });

  it("submits the picked Team Member, amount and reason, then calls onSuccess once the action resolves { success: true }", async () => {
    const user = userEvent.setup();
    const action = vi.fn<
      (prevState: AdvanceQuickEntryFormState, formData: FormData) => Promise<AdvanceQuickEntryFormState>
    >(async () => ({ success: true }));
    const onSuccess = vi.fn();

    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={vi.fn()}
        teamMembers={teamMembers}
        action={action}
        onSuccess={onSuccess}
      />,
    );

    await selectTeamMember(user, "Sita Devi");
    await user.type(screen.getByLabelText("Amount"), "2000");
    await user.type(screen.getByLabelText("Reason"), "Medical emergency");
    await user.click(screen.getByRole("button", { name: /record advance/i }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const submitted = action.mock.calls[0]![1] as FormData;
    expect(submitted.get("teamMemberId")).toBe("tm-2");
    expect(submitted.get("amount")).toBe("2000");
    expect(submitted.get("reason")).toBe("Medical emergency");

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("shows an inline per-field error under Amount and keeps the modal open when the action returns a validation error", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (): Promise<AdvanceQuickEntryFormState> => ({ errors: { amount: ["Amount must be positive"] } }),
    );
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={onOpenChange}
        teamMembers={teamMembers}
        action={action}
        onSuccess={onSuccess}
      />,
    );

    await selectTeamMember(user, "Ramesh Kumar");
    await user.click(screen.getByRole("button", { name: /record advance/i }));

    expect(await screen.findByText("Amount must be positive")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("shows the server-error message inside the modal without navigating away", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (): Promise<AdvanceQuickEntryFormState> => ({
        formError: "Something went wrong recording the Advance. Please try again.",
      }),
    );

    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={vi.fn()}
        teamMembers={teamMembers}
        action={action}
        onSuccess={vi.fn()}
      />,
    );

    await selectTeamMember(user, "Ramesh Kumar");
    await user.type(screen.getByLabelText("Amount"), "500");
    await user.click(screen.getByRole("button", { name: /record advance/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });

  it("keeps every typed field showing its value after a server-returned formError, instead of React 19's native form.reset() wiping the form (regression)", async () => {
    const user = userEvent.setup();
    const action = vi.fn(
      async (): Promise<AdvanceQuickEntryFormState> => ({
        formError: "Something went wrong recording the Advance. Please try again.",
      }),
    );

    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={vi.fn()}
        teamMembers={teamMembers}
        action={action}
        onSuccess={vi.fn()}
      />,
    );

    await selectTeamMember(user, "Sita Devi");
    await user.type(screen.getByLabelText("Amount"), "500");
    await user.type(screen.getByLabelText("Reason"), "Medical emergency");
    await user.click(screen.getByRole("button", { name: /record advance/i }));

    await screen.findByRole("alert");

    expect(screen.getByLabelText("Team Member")).toHaveValue("Sita Devi");
    expect(screen.getByLabelText("Amount")).toHaveValue(500);
    expect(screen.getByLabelText("Reason")).toHaveValue("Medical emergency");
  });

  it("closes with no record created when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={onOpenChange}
        teamMembers={teamMembers}
        action={action}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it("shows an inline 'couldn't load' state on the combobox when the Team Member fetch failed, without blocking the rest of the modal", () => {
    render(
      <AdvanceQuickEntryModal
        open
        onOpenChange={vi.fn()}
        teamMembers={[]}
        teamMembersError="Couldn't load Team Members"
        action={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("Couldn't load Team Members")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record advance/i })).toBeInTheDocument();
  });

  it("renders nothing in the document when closed", () => {
    render(
      <AdvanceQuickEntryModal
        open={false}
        onOpenChange={vi.fn()}
        teamMembers={teamMembers}
        action={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
