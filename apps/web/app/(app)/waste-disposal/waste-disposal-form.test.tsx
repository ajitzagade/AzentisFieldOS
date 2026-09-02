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
