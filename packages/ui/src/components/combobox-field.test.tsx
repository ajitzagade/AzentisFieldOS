import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ComboboxField, type ComboboxFieldOption } from "./combobox-field";

const OPTIONS: ComboboxFieldOption[] = [
  { value: "id-cement", label: "Cement", description: "Bags" },
  { value: "id-steel", label: "Steel — 12mm", description: "Kg" },
  { value: "id-pipe", label: "RCC Pipe — 300mm", description: "Nos" },
];

function Controlled({ initial = null, onChange }: { initial?: string | null; onChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <ComboboxField
      label="Material"
      options={OPTIONS}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("ComboboxField", () => {
  it("renders a labelled combobox input, never exposing option ids as text", () => {
    render(<Controlled />);
    const input = screen.getByLabelText("Material");
    expect(input).toHaveAttribute("role", "combobox");
    expect(screen.queryByText("id-cement")).not.toBeInTheDocument();
  });

  it("filters options as the user types and selects one, reporting its internal value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    const input = screen.getByLabelText("Material");
    await user.type(input, "cem");

    await waitFor(() => {
      expect(screen.getByText("Cement")).toBeInTheDocument();
    });
    expect(screen.queryByText("Steel — 12mm")).not.toBeInTheDocument();

    await user.click(screen.getByText("Cement"));
    expect(onChange).toHaveBeenCalledWith("id-cement");
    expect(input).toHaveValue("Cement");
  });

  it("also matches on the option description (e.g. searching by unit or size)", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.type(screen.getByLabelText("Material"), "nos");

    await waitFor(() => {
      expect(screen.getByText("RCC Pipe — 300mm")).toBeInTheDocument();
    });
    expect(screen.queryByText("Cement")).not.toBeInTheDocument();
  });

  it("shows the no-results message when the query matches nothing", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.type(screen.getByLabelText("Material"), "zzz");

    await waitFor(() => {
      expect(screen.getByText("No matches found")).toBeInTheDocument();
    });
  });

  it("clears the selection via the clear button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial="id-steel" onChange={onChange} />);

    expect(screen.getByLabelText("Material")).toHaveValue("Steel — 12mm");
    await user.click(screen.getByRole("button", { name: "Clear Material" }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText("Material")).toHaveValue("");
  });

  it("disables the input and announces loading while options are being fetched", () => {
    render(<ComboboxField label="Vendor" options={[]} value={null} onValueChange={() => {}} loading />);
    const input = screen.getByLabelText("Vendor");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Loading…");
  });

  it("wires hint and error text with the correct aria attributes", () => {
    const { rerender } = render(
      <ComboboxField label="Vendor" options={OPTIONS} value={null} onValueChange={() => {}} hint="Start typing a name" />,
    );
    expect(screen.getByLabelText("Vendor")).toHaveAccessibleDescription("Start typing a name");

    rerender(
      <ComboboxField label="Vendor" options={OPTIONS} value={null} onValueChange={() => {}} error="Vendor is required" />,
    );
    const input = screen.getByLabelText("Vendor");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Vendor is required");
  });

  it("supports keyboard selection with arrow keys and Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    const input = screen.getByLabelText("Material");
    await user.type(input, "e");
    await waitFor(() => {
      expect(screen.getByText("Cement")).toBeInTheDocument();
    });
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toMatch(/^id-/);
  });

  it("shows each option's meta (e.g. its stock balance) in the list but never matches it when filtering", async () => {
    const user = userEvent.setup();
    const withMeta: ComboboxFieldOption[] = [
      { value: "id-cement", label: "Cement", meta: "1,200 Bag" },
      { value: "id-steel", label: "Steel — 12mm", meta: "No stock", metaTone: "warning" },
    ];
    render(<ComboboxField label="Material" options={withMeta} value={null} onValueChange={() => {}} />);

    const input = screen.getByLabelText("Material");
    await user.type(input, "cement");
    expect(await screen.findByText("1,200 Bag")).toBeInTheDocument();
    expect(screen.queryByText("Steel — 12mm")).not.toBeInTheDocument();

    // Typing a balance figure is not a name search — it must match nothing.
    await user.clear(input);
    await user.type(input, "1,200");
    expect(await screen.findByText("No matches found")).toBeInTheDocument();
  });

  it("shows an always-visible + Add row when onCreateNew is provided, and fires it on click without selecting a data option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCreateNew = vi.fn();
    render(
      <ComboboxField label="Material" options={OPTIONS} value={null} onValueChange={onChange} onCreateNew={onCreateNew} />,
    );

    await user.click(screen.getByLabelText("Material"));
    const addRow = await screen.findByText("+ Add Material");
    await user.click(addRow);

    expect(onCreateNew).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the + Add row visible even when typing filters every option out", async () => {
    const user = userEvent.setup();
    const onCreateNew = vi.fn();
    render(<ComboboxField label="Material" options={OPTIONS} value={null} onValueChange={() => {}} onCreateNew={onCreateNew} />);

    await user.type(screen.getByLabelText("Material"), "zzz");

    await waitFor(() => {
      expect(screen.getByText("No matches found")).toBeInTheDocument();
    });
    expect(screen.getByText("+ Add Material")).toBeInTheDocument();
  });

  it("uses a custom createNewLabel when provided", async () => {
    const user = userEvent.setup();
    render(
      <ComboboxField
        label="Vendor"
        options={OPTIONS}
        value={null}
        onValueChange={() => {}}
        onCreateNew={() => {}}
        createNewLabel="+ Add Vendor"
      />,
    );

    await user.click(screen.getByLabelText("Vendor"));
    expect(await screen.findByText("+ Add Vendor")).toBeInTheDocument();
  });

  it("does not render a + Add row when onCreateNew is omitted", async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByLabelText("Material"));
    expect(screen.queryByText(/\+ Add/)).not.toBeInTheDocument();
  });

  it("colors the hint by tone and politely announces a danger-toned hint", () => {
    render(
      <ComboboxField
        label="Material"
        options={OPTIONS}
        value={null}
        onValueChange={() => {}}
        hint="Insufficient stock — only 80 Bag available"
        hintTone="danger"
      />,
    );
    const hint = screen.getByText("Insufficient stock — only 80 Bag available");
    expect(hint).toHaveClass("text-danger-700");
    expect(hint).toHaveAttribute("role", "status");
  });
});
