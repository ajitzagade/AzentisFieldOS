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

import { AppShellWithChrome } from "./layout";

function mockMe(role: string) {
  authedFetchMock.mockResolvedValue({ ok: true, json: async () => ({ role }) });
}

// Perf review 2026-09-03: role/tenantName resolution moved out of the
// default-exported AppLayout into this named AppShellWithChrome component,
// wrapped in a <Suspense> boundary by AppLayout so the loading skeleton can
// stream immediately on navigation instead of blocking on these fetches.
// Testing-library's render() can't drive React's real Suspense/RSC
// streaming machinery, so these tests target AppShellWithChrome directly —
// the same role-resolution behavior AppLayout delegates to at runtime.
async function renderLayout() {
  render(await AppShellWithChrome({ children: <div>page content</div> }));
}

afterEach(() => {
  vi.restoreAllMocks();
  authedFetchMock.mockReset();
});

describe("AppLayout role resolution", () => {
  it("renders the trimmed task-first sidebar for a SITE_SUPERVISOR, without the Settings link", async () => {
    mockMe("SITE_SUPERVISOR");
    await renderLayout();

    expect(authedFetchMock).toHaveBeenCalledWith("/users/me", { cache: "no-store" });
    // Supervisor nav is the 7-item trim: Home instead of Dashboard…
    expect(screen.getAllByRole("link", { name: /Home/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Team & Attendance/ })).toBeInTheDocument();
    // …owner surfaces are not in the supervisor's nav…
    expect(screen.queryByRole("link", { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Vendors/ })).not.toBeInTheDocument();
    // …and Settings (Owner/Admin-only, 404s for a Supervisor) is not shown.
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders the full Owner/Admin sidebar (incl. Settings) when /users/me resolves OWNER_ADMIN", async () => {
    mockMe("OWNER_ADMIN");
    await renderLayout();

    // "Dashboard" now appears twice for OWNER_ADMIN — once in the full
    // sidebar, once in Story 19.4's Owner mobile quick-bar — matching the
    // existing Supervisor "Home" assertion's getAllByRole precedent above.
    expect(screen.getAllByRole("link", { name: /Dashboard/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Settings/ })).toBeInTheDocument();
  });

  it("defaults to the least-privileged role if the identity lookup fails (supervisor sidebar, never the admin-only Settings)", async () => {
    authedFetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await renderLayout();

    // Falls back to SITE_SUPERVISOR: the trimmed sidebar renders, but Settings does not.
    expect(screen.getAllByRole("link", { name: /Home/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});
