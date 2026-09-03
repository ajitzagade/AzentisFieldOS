import { describe, expect, it } from "vitest";
import { entityHref } from "./entity-href";

describe("entityHref", () => {
  it("builds the correct route for each of the four shared entity types", () => {
    expect(entityHref("site", "s1")).toBe("/sites/s1");
    expect(entityHref("vendor", "v1")).toBe("/vendors/v1");
    expect(entityHref("team-member", "tm1")).toBe("/team/tm1");
    expect(entityHref("subcontractor", "sc1")).toBe("/subcontractors/sc1");
  });
});
