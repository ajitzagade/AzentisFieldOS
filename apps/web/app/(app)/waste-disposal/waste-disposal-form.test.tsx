import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createWasteDisposalAction: Object.assign(vi.fn(async () => ({})), {
    bind: vi.fn(() => vi.fn(async () => ({}))),
  }),
}));

import { WasteDisposalForm } from "./waste-disposal-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const vendors = [{ id: "vendor1", name: "Shree Balaji Traders" }];

const correctionInitial = {
  siteId: "site1",
  wasteType: "Construction debris",
  ownership: "HIRED" as const,
  vendorId: "vendor1",
  tripCount: 8,
  ratePerTrip: "1500",
  otherCharges: "300",
  disposedAt: "2026-08-30",
};

beforeEach(() => {
  window.localStorage.clear();
});

// Review 2026-09-02: this money-bearing correction path (unique semantics —
// optional "blank = no change" other-charges field) previously shipped with
// zero coverage; pin the delta wiring against the real recorded originals.
describe("WasteDisposalForm — corrected-value corrections", () => {
  it("derives the trip-count delta from the recorded original", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WasteDisposalForm mode="correct" correctsId="wd1" sites={sites} vendors={vendors} equipment={[]} initial={correctionInitial} />,
    );

    expect(screen.getByText(/Currently recorded: 8/)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Corrected number of trips/), "6");

    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="tripCount"]');
    expect(hidden).toHaveValue("-2");
  });

  it("an untouched Corrected other charges submits empty — no change, not a delta to zero", () => {
    const { container } = render(
      <WasteDisposalForm mode="correct" correctsId="wd1" sites={sites} vendors={vendors} equipment={[]} initial={correctionInitial} />,
    );

    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="otherCharges"]');
    expect(hidden).toHaveValue("");
  });
});

// Feature 2026-09-06: an advance to a HIRED disposal's Vendor, auto-filled
// from the same trips × rate the trip's own Total derives from.
describe("WasteDisposalForm — advance to the hired Vendor", () => {
  it("shows the advance checkbox only for a HIRED disposal", async () => {
    const user = userEvent.setup();
    render(<WasteDisposalForm mode="new" sites={sites} vendors={vendors} equipment={[]} />);

    expect(screen.getByText(/Give an advance to this Vendor/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Own / Hired"), "OWN");
    expect(screen.queryByText(/Give an advance to this Vendor/)).not.toBeInTheDocument();
  });

  it("auto-fills the advance amount from trips × rate, and shows the total in words", async () => {
    const user = userEvent.setup();
    render(<WasteDisposalForm mode="new" sites={sites} vendors={vendors} equipment={[]} />);

    await user.type(screen.getByLabelText("Number of trips"), "4");
    await user.type(screen.getByLabelText("Rate per trip"), "500");
    expect(screen.getByText("Two Thousand Rupees")).toBeInTheDocument();

    await user.click(screen.getByText(/Give an advance to this Vendor/));
    expect(screen.getByLabelText("Advance amount")).toHaveValue(2000);
  });

  it("stops following the computed total once the user edits the advance amount themselves", async () => {
    const user = userEvent.setup();
    render(<WasteDisposalForm mode="new" sites={sites} vendors={vendors} equipment={[]} />);

    await user.type(screen.getByLabelText("Number of trips"), "4");
    await user.type(screen.getByLabelText("Rate per trip"), "500");
    await user.click(screen.getByText(/Give an advance to this Vendor/));

    const advanceField = screen.getByLabelText("Advance amount");
    await user.clear(advanceField);
    await user.type(advanceField, "1000");

    await user.type(screen.getByLabelText("Number of trips"), "0"); // now 40
    expect(screen.getByLabelText("Advance amount")).toHaveValue(1000);
  });

  // Review finding (2026-09-06): switching away from HIRED and back must
  // not leave a stale checked box + stale typed amount from before the
  // round-trip.
  it("resets the advance checkbox and amount when ownership toggles away from HIRED and back", async () => {
    const user = userEvent.setup();
    render(<WasteDisposalForm mode="new" sites={sites} vendors={vendors} equipment={[]} />);

    await user.type(screen.getByLabelText("Number of trips"), "4");
    await user.type(screen.getByLabelText("Rate per trip"), "500");
    await user.click(screen.getByText(/Give an advance to this Vendor/));
    await user.clear(screen.getByLabelText("Advance amount"));
    await user.type(screen.getByLabelText("Advance amount"), "1000");

    await user.selectOptions(screen.getByLabelText("Own / Hired"), "OWN");
    await user.selectOptions(screen.getByLabelText("Own / Hired"), "HIRED");

    const checkbox = screen.getByRole("checkbox", { name: /Give an advance to this Vendor/ });
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText("Advance amount")).not.toBeInTheDocument();
  });
});
