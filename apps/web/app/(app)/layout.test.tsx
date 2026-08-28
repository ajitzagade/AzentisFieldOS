import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The layout is a server component that resolves the real role from
// GET /users/me (Story 14.2) — the concrete regression test for the AGENTS.md
// TODO this story closes (AppShell no longer hardcodes "OWNER_ADMIN").
const authedFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ authedFetch: authedFetchMock }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: () => {}, replace: () => {} }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import AppLayout from "./layout";

function mockMe(role: string) {
  authedFetchMock.mockResolvedValue({ ok: true, json: async () => ({ role }) });
}

async function renderLayout() {
  render(await AppLayout({ children: <div>page content</div> }));
}

afterEach(() => {
  vi.restoreAllMocks();
  authedFetchMock.mockReset();
});

describe("AppLayout role resolution", () => {
  it("renders the sidebar for a SITE_SUPERVISOR too, but without the Settings link", async () => {
    mockMe("SITE_SUPERVISOR");
    await renderLayout();

    expect(authedFetchMock).toHaveBeenCalledWith("/users/me", { cache: "no-store" });
    // Sidebar shell for all roles now — nav is present…
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    // …but Settings (Owner/Admin-only, 404s for a Supervisor) is not shown.
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders the full Owner/Admin sidebar (incl. Settings) when /users/me resolves OWNER_ADMIN", async () => {
    mockMe("OWNER_ADMIN");
    await renderLayout();

    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/ })).toBeInTheDocument();
  });

  it("defaults to the least-privileged role if the identity lookup fails (sidebar, but never the admin-only Settings)", async () => {
    authedFetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await renderLayout();

    // Falls back to SITE_SUPERVISOR: the sidebar renders, but Settings does not.
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});
