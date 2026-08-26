import { describe, expect, it, vi } from "vitest";

// The real renderer builds a next/og ImageResponse (satori + WASM) — heavy and
// network/font-dependent under jsdom. Mock it to a lightweight PNG Response so
// these tests exercise the route's param branching, not image rasterization.
vi.mock("../../../lib/pwa-icon", () => ({
  renderTenantIcon: vi.fn(
    () => new Response("PNG", { status: 200, headers: { "Content-Type": "image/png" } }),
  ),
}));

import { GET } from "./route";
import { renderTenantIcon } from "../../../lib/pwa-icon";

describe("icons/[icon] route handler", () => {
  it("404s for an unknown icon param and never renders", async () => {
    const res = await GET(new Request("http://localhost/icons/nope"), {
      params: Promise.resolve({ icon: "nope" }),
    });

    expect(res.status).toBe(404);
    expect(renderTenantIcon).not.toHaveBeenCalled();
  });

  it("renders a PNG image for a valid icon param", async () => {
    const res = await GET(new Request("http://localhost/icons/icon-192"), {
      params: Promise.resolve({ icon: "icon-192" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(renderTenantIcon).toHaveBeenCalledWith({ size: 192, maskable: false });
  });
});
