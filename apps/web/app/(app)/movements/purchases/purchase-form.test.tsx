import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createPurchaseAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

const createVendorQuickActionMock = vi.fn();
vi.mock("../../vendors/new/actions", () => ({
  createVendorQuickAction: (...args: unknown[]) => createVendorQuickActionMock(...args),
}));

import { PurchaseForm } from "./purchase-form";
import { createPurchaseAction } from "./actions";

const materialSizes = [{ id: "ms1", label: "Cement (OPC 53 Grade)" }];
const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const vendors = [{ id: "v1", name: "Shree Balaji Traders" }];

describe("PurchaseForm", () => {
  it("renders the core fields for a new Purchase with Godown selected by default", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Vendor")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Material / Size")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.queryByLabelText("Site")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Purchase" })).toBeInTheDocument();
  });

  it("shows the Site picker only when destination is switched to Site", async () => {
    const user = userEvent.setup();
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    await user.selectOptions(screen.getByLabelText("Destination"), "SITE");

    // D5: the Site picker is the searchable SiteField combobox, not a native select.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
  });

  it("shows a correction banner with a required reason field, and locks Vendor/Material/Destination in correct mode", () => {
    render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", rate: "50", totalAmount: "5000", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: true }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Vendor")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Destination")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("D4: correct mode asks for the corrected quantity and derives the signed delta underneath", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", rate: "50", totalAmount: "5000", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: true }}
      />,
    );

    const field = screen.getByLabelText("Corrected quantity");
    expect(screen.getByText(/Currently recorded: 100/)).toBeInTheDocument();
    await user.type(field, "80");
    expect(screen.getByText(/Was 100 → change of −20 will be recorded/)).toBeInTheDocument();
    // The FormData contract is unchanged: a hidden `quantity` carries the delta.
    expect(container.querySelector('input[type="hidden"][name="quantity"]')).toHaveValue("-20");
  });

  it("D7: correcting a still-unpriced Purchase renders no pricing fields, only the pending note", () => {
    render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: false }}
      />,
    );

    expect(screen.queryByLabelText("Rate")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Total Amount")).not.toBeInTheDocument();
    expect(screen.getByText(/no pricing yet/)).toBeInTheDocument();
  });

  it("Story 5.3: with fixedDestination='SITE', shows the Site picker immediately and hides the Destination toggle", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} fixedDestination="SITE" />);

    expect(screen.queryByLabelText("Destination")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
  });

  it("Story 9.1 / inline quick-create: sources the Vendor field from a searchable Vendor picker, not free text, with an always-visible + Add Vendor row", async () => {
    const user = userEvent.setup();
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    const vendorField = screen.getByLabelText("Vendor");
    expect(vendorField).toHaveAttribute("role", "combobox");
    await user.click(vendorField);
    expect(await screen.findByText("+ Add Vendor")).toBeInTheDocument();
  });
});

describe("PurchaseForm — Receiver Name suggestions (story 15.5)", () => {
  it("renders team names as datalist options linked to the Receiver field, still free-text", () => {
    const { container } = render(
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} teamNames={["Suresh Kumar", "Ganesh Jadhav"]} />,
    );

    const input = screen.getByLabelText("Receiver Name");
    expect(input).toHaveAttribute("list", "purchase-receiver-names");
    const datalist = container.querySelector("datalist#purchase-receiver-names");
    expect(datalist).not.toBeNull();
    const options = [...datalist!.querySelectorAll("option")].map((o) => o.getAttribute("value"));
    expect(options).toEqual(["Suresh Kumar", "Ganesh Jadhav"]);
    // Plain text input — a name outside the team is always accepted.
    expect(input).not.toHaveAttribute("readonly");
  });

  it("renders an empty datalist (plain text field) when no team names are provided", () => {
    const { container } = render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);
    expect(container.querySelectorAll("datalist#purchase-receiver-names option")).toHaveLength(0);
  });
});

describe("PurchaseForm — preserves typed values when the Server Action returns an error (regression)", () => {
  // Real UUIDs (unlike the "v1"/"ms1" ids used by the render-only tests
  // above) — createPurchaseSchema requires vendorId/materialSizeId to be
  // UUIDs, and this test drives a real submission through client validation
  // (AD-7) into the mocked Server Action, so the ids must actually parse.
  const uuidVendors = [{ id: "11111111-1111-4111-8111-111111111111", name: "Shree Balaji Traders" }];
  const uuidMaterialSizes = [{ id: "22222222-2222-4222-8222-222222222222", label: "Cement (OPC 53 Grade)" }];

  it("keeps every typed field showing its value after a server-returned formError, instead of React 19's native form.reset() wiping the form", async () => {
    const user = userEvent.setup();
    vi.mocked(createPurchaseAction).mockResolvedValueOnce({
      formError: "A Purchase with this Vendor and Invoice/Challan number already exists",
    });

    render(<PurchaseForm mode="new" materialSizes={uuidMaterialSizes} sites={sites} vendors={uuidVendors} />);

    await user.type(screen.getByLabelText("Vendor"), "Shree Balaji");
    await waitFor(() => expect(screen.getByText("Shree Balaji Traders")).toBeInTheDocument());
    await user.click(screen.getByText("Shree Balaji Traders"));
    await user.type(screen.getByLabelText("Material / Size"), "Cement");
    await waitFor(() => expect(screen.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument());
    await user.click(screen.getByText("Cement (OPC 53 Grade)"));
    await user.type(screen.getByLabelText("Quantity"), "50");
    await user.type(screen.getByLabelText("Rate"), "390");

    await user.click(screen.getByRole("button", { name: "Record Purchase" }));

    await screen.findByText("A Purchase with this Vendor and Invoice/Challan number already exists");

    expect(screen.getByLabelText("Vendor")).toHaveValue("Shree Balaji Traders");
    expect(screen.getByLabelText("Material / Size")).toHaveValue("Cement (OPC 53 Grade)");
    expect(screen.getByLabelText("Quantity")).toHaveValue(50);
    expect(screen.getByLabelText("Rate")).toHaveValue(390);
  });
});

describe("PurchaseForm — pricing visibility and auto-total (D5/D7)", () => {
  it("hides Rate/Total/Payment Status for a Supervisor and shows the office note", () => {
    render(
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} showPricing={false} />,
    );

    expect(screen.queryByLabelText("Rate")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Total Amount")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Payment Status")).not.toBeInTheDocument();
    expect(screen.getByText(/Rates & amounts are entered by the office/)).toBeInTheDocument();
  });

  it("auto-computes Total = quantity × rate for the Owner, still editable", async () => {
    const user = userEvent.setup();
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    await user.type(screen.getByLabelText("Quantity"), "50");
    await user.type(screen.getByLabelText("Rate"), "390");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19500);
    // The amount-in-words readback confirms the auto-computed figure.
    expect(screen.getByText(/Nineteen Thousand Five Hundred/i)).toBeInTheDocument();

    // Manual override wins until quantity/rate change again.
    await user.clear(screen.getByLabelText("Total Amount"));
    await user.type(screen.getByLabelText("Total Amount"), "19600");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19600);
  });

  it("folds the optional paperwork fields behind a More details disclosure", () => {
    const { container } = render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText(/More details/)).toBeInTheDocument();
  });
});

describe("PurchaseForm — inline Vendor quick-create round-trip", () => {
  it("creating a Vendor via + Add Vendor selects it into the picker and leaves every other typed field unchanged", async () => {
    const user = userEvent.setup();
    createVendorQuickActionMock.mockReset();
    createVendorQuickActionMock.mockResolvedValue({ success: true, id: "vendor-new", name: "Fresh Concrete Traders" });

    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    // Fill in other fields first — a quick-create round-trip must never
    // disturb them (I/O matrix: "parent form's other fields unchanged").
    await user.type(screen.getByLabelText("Material / Size"), "Cement");
    await waitFor(() => expect(screen.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument());
    await user.click(screen.getByText("Cement (OPC 53 Grade)"));
    await user.type(screen.getByLabelText("Quantity"), "50");
    await user.type(screen.getByLabelText("Rate"), "390");

    await user.click(screen.getByLabelText("Vendor"));
    await user.click(await screen.findByText("+ Add Vendor"));

    const dialog = await screen.findByRole("dialog", { name: "Add Vendor" });
    await user.type(within(dialog).getByLabelText("Name"), "Fresh Concrete Traders");
    await user.click(within(dialog).getByRole("button", { name: "Create Vendor" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add Vendor" })).not.toBeInTheDocument());
    expect(screen.getByLabelText("Vendor")).toHaveValue("Fresh Concrete Traders");

    // The parent form's own fields, typed before the modal ever opened,
    // survived the round-trip untouched.
    expect(screen.getByLabelText("Material / Size")).toHaveValue("Cement (OPC 53 Grade)");
    expect(screen.getByLabelText("Quantity")).toHaveValue(50);
    expect(screen.getByLabelText("Rate")).toHaveValue(390);
  });
});
