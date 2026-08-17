import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateMachineryAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { EditMachineryForm } from "./edit-machinery-form";
import type { MachineryDetail } from "./page";

const machinery: MachineryDetail = {
  id: "m1",
  name: "JCB 3DX",
  assetNumber: "AST-001",
  model: "3DX",
  ownership: "Owned",
  operator: "Ramesh",
  currentStatus: "AT_SITE",
  type: { id: "t1", name: "Excavator" },
  currentSite: { id: "s1", name: "NH-48 Highway Widening" },
};

const machineryTypes = [{ id: "t1", name: "Excavator" }];

describe("EditMachineryForm", () => {
  it("pre-fills every field with the Machine's current values", () => {
    render(<EditMachineryForm machinery={machinery} machineryTypes={machineryTypes} />);

    expect(screen.getByLabelText("Name")).toHaveValue("JCB 3DX");
    expect(screen.getByLabelText("Asset / Registration Number")).toHaveValue("AST-001");
    expect(screen.getByLabelText("Model")).toHaveValue("3DX");
    expect(screen.getByLabelText("Ownership")).toHaveValue("Owned");
    expect(screen.getByLabelText("Operator")).toHaveValue("Ramesh");
    expect(screen.getByLabelText("Type")).toHaveValue("t1");
  });

  it("never renders a currentStatus/currentSiteId field — those are exclusively written by Story 8.2's movement flow", () => {
    render(<EditMachineryForm machinery={machinery} machineryTypes={machineryTypes} />);

    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/current site/i)).not.toBeInTheDocument();
  });
});
