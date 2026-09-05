import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GapFlag } from "./gap-flag";
import { GapFlagList } from "./gap-flag-list";

function flags(names: string[]) {
  return names.map((name) => (
    <GapFlag key={name} icon={<svg />} message={`${name} is missing`} action={<button>View {name}</button>} />
  ));
}

describe("GapFlagList", () => {
  it("renders nothing when count is 0", () => {
    const { container } = render(<GapFlagList count={0} summary="unused">{flags([])}</GapFlagList>);
    expect(container.firstChild).toBeNull();
  });

  it("renders every flag inline below the threshold", () => {
    render(
      <GapFlagList count={2} summary="2 items">
        {flags(["Alpha", "Beta"])}
      </GapFlagList>,
    );
    expect(screen.getByText("Alpha is missing")).toBeVisible();
    expect(screen.getByText("Beta is missing")).toBeVisible();
    expect(screen.queryByText("2 items")).toBeNull();
  });

  it("folds behind a summary toggle at/above the threshold, but defaults open — FR-35 never hides an absence", () => {
    const { container } = render(
      <GapFlagList count={3} summary="3 sites need attention">
        {flags(["Alpha", "Beta", "Gamma"])}
      </GapFlagList>,
    );
    expect(screen.getByText("3 sites need attention")).toBeInTheDocument();
    expect(container.querySelector("details")).toHaveProperty("open", true);
    expect(screen.getByText("Alpha is missing")).toBeVisible();
    expect(screen.getByText("Beta is missing")).toBeVisible();
    expect(screen.getByText("Gamma is missing")).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("overrides DetailsDisclosure's default dashed border with a solid warning border when folded", () => {
    const { container } = render(
      <GapFlagList count={3} summary="3 sites need attention">
        {flags(["Alpha", "Beta", "Gamma"])}
      </GapFlagList>,
    );
    const details = container.querySelector("details");
    expect(details?.className).toContain("border-solid");
    expect(details?.className).not.toContain("border-dashed");
  });

  it("respects a custom threshold", () => {
    render(
      <GapFlagList count={2} summary="2 items" threshold={2}>
        {flags(["Alpha", "Beta"])}
      </GapFlagList>,
    );
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });
});
