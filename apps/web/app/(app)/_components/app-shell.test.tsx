import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";
import { useOpenGlobalSearch } from "./global-search";

let mockPathname = "/";
const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: pushMock, replace: () => {}, refresh: refreshMock }),
}));
vi.mock("next/link", () => ({
  // Forwards every prop (not just href/children/className) — OwnerQuickBar's
  // aria-current and NavLink's onClick both rely on next/link passing
  // through to the underlying <a>, same as the real component does.
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// The Owner quick-bar's Quick Add sheet can open the shared Advance
// quick-entry modal (Story 19.4) — same mocks advance-quick-entry-trigger.test.tsx
// and global-search.test.tsx use, so that path never hits a real network call.
const teamMembersFetchMock = vi.fn();
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => teamMembersFetchMock,
}));
const createAdvanceQuickActionMock = vi.fn();
vi.mock("@/app/(app)/team/[id]/advances/actions", () => ({
  createAdvanceQuickAction: (...args: unknown[]) => createAdvanceQuickActionMock(...args),
}));

describe("AppShell", () => {
  it("renders the full grouped sidebar for OWNER_ADMIN", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    // Scoped to the desktop rail (the <aside> landmark, role="complementary")
    // since Story 19.4's Owner quick-bar also renders "Dashboard"/"Sites"
    // links below `lg` — jsdom doesn't apply the `lg:flex` breakpoint, so
    // both are simultaneously present in the tree.
    const sidebar = screen.getByRole("complementary");

    // Ungrouped items
    expect(within(sidebar).getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Sites/ })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Daily Report/ })).toBeInTheDocument();

    // Group labels (Story 16.4 regroup) — "Machinery & Vehicles" and
    // "Reports" each appear twice (the promoted single-item group's own
    // label plus its one nav item), since neither is nested under a
    // broader group name anymore. "Materials" now appears once — it's
    // only an item label; its group is called "Stock".
    expect(screen.getAllByText("Materials")).toHaveLength(1);
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Money")).toBeInTheDocument();
    expect(screen.getAllByText("Machinery & Vehicles")).toHaveLength(2);
    expect(screen.getAllByText("Reports")).toHaveLength(2);

    // Grouped items
    expect(within(sidebar).getByRole("link", { name: /Inventory/ })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Machinery & Vehicles/ })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Reports/ })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Waste & Disposal/ })).toBeInTheDocument();

    // Settings pinned
    expect(within(sidebar).getByRole("link", { name: /Settings/ })).toBeInTheDocument();

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders the global search control above every grouped nav item (Story 16.4 AC #4)", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    // Two "Search" controls render (desktop rail + mobile top bar) — the
    // desktop rail's is first in document order.
    const [searchButton] = screen.getAllByRole("button", { name: "Search" });
    const stockGroupLabel = screen.getByText("Stock");

    expect(
      Boolean(searchButton!.compareDocumentPosition(stockGroupLabel) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
  });

  it("marks the nav item matching the current path with the active pill", () => {
    mockPathname = "/inventory";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
    // Scoped to the desktop rail — see the note in the previous test.
    const sidebar = screen.getByRole("complementary");
    const inventoryLink = within(sidebar).getByRole("link", { name: /Inventory/ });
    const dashboardLink = within(sidebar).getByRole("link", { name: /Dashboard/ });
    expect(inventoryLink.className).toContain("bg-accent-teal-700");
    expect(dashboardLink.className).not.toContain("bg-accent-teal-700");
  });

  it("marks Dashboard active only at the exact root path, not for every route", () => {
    mockPathname = "/sites";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByRole("link", { name: /Dashboard/ }).className).not.toContain("bg-accent-teal-700");
    expect(within(sidebar).getByRole("link", { name: /Sites/ }).className).toContain("bg-accent-teal-700");
  });

  it("exposes an accessible mobile nav toggle for OWNER_ADMIN that opens the drawer", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
    const toggle = screen.getByRole("button", { name: /Open navigation menu/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "app-mobile-nav");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // The drawer is now mounted with its own close control.
    expect(screen.getAllByRole("button", { name: /Close navigation menu/ }).length).toBeGreaterThan(0);
  });

  it("closes the mobile drawer on Escape", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Open navigation menu/ }));
    expect(screen.getByRole("button", { name: /Open navigation menu/ })).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: /Open navigation menu/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("exposes the mobile nav toggle for SITE_SUPERVISOR too (sidebar shell for all roles)", () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: /Open navigation menu/ })).toBeInTheDocument();
  });

  it("renders the trimmed sidebar for SITE_SUPERVISOR, hiding Owner/Admin-only surfaces", () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );
    // Sidebar nav is present for the Supervisor now (same shell as Owner/Admin).
    expect(screen.getAllByRole("link", { name: /Home/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Vendors/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Materials").length).toBeGreaterThan(0);
    // Settings hard-404s for a Supervisor, so it must not appear as a link.
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

describe("AppShell — global search (Story 16.2)", () => {
  it("shows the same visible search control for OWNER_ADMIN and SITE_SUPERVISOR, and opens the palette", async () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );

    const searchButtons = screen.getAllByRole("button", { name: "Search" });
    expect(searchButtons.length).toBeGreaterThan(0);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(searchButtons[0]!);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("opens the palette via the Ctrl+K keyboard shortcut", async () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});

describe("AppShell — PWA install", () => {
  function fireBeforeInstallPrompt() {
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt: vi.fn(async () => {}),
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    });
    window.dispatchEvent(event);
    return event;
  }

  it("does not show a Download app action until the browser signals installability", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
    expect(screen.queryByRole("button", { name: /Download app/i })).not.toBeInTheDocument();
  });

  it("shows a Download app action above Sign out once beforeinstallprompt fires, gated by a confirmation dialog", async () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    let event!: ReturnType<typeof fireBeforeInstallPrompt>;
    act(() => {
      event = fireBeforeInstallPrompt();
    });

    const downloadButton = await screen.findByRole("button", { name: /Download app/i });
    expect(event.prompt).not.toHaveBeenCalled();

    fireEvent.click(downloadButton);
    const confirmButton = await screen.findByRole("button", { name: "Install" });
    expect(event.prompt).not.toHaveBeenCalled();

    fireEvent.click(confirmButton);
    await waitFor(() => expect(event.prompt).toHaveBeenCalledTimes(1));
  });
  // The bottom quick-bar is the Supervisor's primary one-tap mobile layer —
  // pin its presence, its four destinations, and its absence for Owners.
  it("renders the Supervisor quick-bar with its four fixed destinations", () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );

    const bar = screen.getByRole("navigation", { name: "Quick actions" });
    const links = within(bar).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/dsr/new", "/movements", "/help"]);
    // "Report" deep-links the entry form, not the log.
    expect(within(bar).getByRole("link", { name: /Report/ })).toHaveAttribute("href", "/dsr/new");
  });

  // Story 19.4: OWNER_ADMIN now gets its own "Quick actions" bar (a
  // different bar from the Supervisor's) rather than none at all — the two
  // roles are mutually exclusive, so exactly one bar ever renders.
  it("renders the Owner quick-bar, not the Supervisor's, for OWNER_ADMIN", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    const bars = screen.getAllByRole("navigation", { name: "Quick actions" });
    expect(bars).toHaveLength(1);
    // The Supervisor's four fixed hrefs must not appear on the Owner's bar.
    expect(within(bars[0]!).queryByRole("link", { name: /^Report/ })).not.toBeInTheDocument();
  });
});

describe("AppShell — Owner mobile quick-bar (Story 19.4)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    teamMembersFetchMock.mockReset();
    createAdvanceQuickActionMock.mockReset();
  });

  function renderOwner() {
    mockPathname = "/";
    return render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );
  }

  it("shows Dashboard, Sites, Quick Add, Search, and More as the 5 slots, Dashboard active by aria-current + weight (not color alone)", () => {
    renderOwner();

    const bar = screen.getByRole("navigation", { name: "Quick actions" });
    const dashboardLink = within(bar).getByRole("link", { name: "Dashboard" });
    const sitesLink = within(bar).getByRole("link", { name: "Sites" });

    expect(dashboardLink).toHaveAttribute("href", "/");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLink.className).toContain("font-semibold");
    expect(dashboardLink.className).toContain("text-accent-teal-700");

    expect(sitesLink).toHaveAttribute("href", "/sites");
    expect(sitesLink).not.toHaveAttribute("aria-current");
    expect(sitesLink.className).not.toContain("text-accent-teal-700");

    expect(within(bar).getByRole("button", { name: "Quick Add" })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it('tapping "+" opens the Quick Add sheet with the same curated action list as the Search palette', async () => {
    renderOwner();

    fireEvent.click(screen.getByRole("button", { name: "Quick Add" }));

    expect(await screen.findByText("New Daily Report")).toBeInTheDocument();
    expect(screen.getByText("Record Payment")).toBeInTheDocument();
    expect(screen.getByText("Record Advance")).toBeInTheDocument();
    expect(screen.getByText("Add Purchase")).toBeInTheDocument();
  });

  it("navigating from the Quick Add sheet routes to the action's href and closes the sheet", async () => {
    renderOwner();

    fireEvent.click(screen.getByRole("button", { name: "Quick Add" }));
    fireEvent.click(await screen.findByText("Add Purchase"));

    expect(pushMock).toHaveBeenCalledWith("/movements/purchases/new");
    await waitFor(() => expect(screen.queryByText("Add Purchase")).not.toBeInTheDocument());
  });

  it('selecting "Record Advance" from the Quick Add sheet opens the shared Advance quick-entry modal in place, no navigation', async () => {
    teamMembersFetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    renderOwner();

    fireEvent.click(screen.getByRole("button", { name: "Quick Add" }));
    fireEvent.click(await screen.findByText("Record Advance"));

    expect(await screen.findByRole("dialog", { name: "Record Advance" })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('tapping "Search" opens the same global search palette as ⌘K (no second controller instance)', async () => {
    renderOwner();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const bar = screen.getByRole("navigation", { name: "Quick actions" });
    fireEvent.click(within(bar).getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it('tapping "More" opens the full sidebar drawer — the exact one the hamburger opens', () => {
    renderOwner();

    const toggle = screen.getByRole("button", { name: /Open navigation menu/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const bar = screen.getByRole("navigation", { name: "Quick actions" });
    fireEvent.click(within(bar).getByRole("button", { name: "More" }));

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Scoped to the drawer itself — the desktop rail also has a "Vendors"
    // link simultaneously present in jsdom (no `lg:flex` breakpoint applied).
    const drawer = document.getElementById("app-mobile-nav");
    expect(drawer).not.toBeNull();
    expect(within(drawer as HTMLElement).getByRole("link", { name: /Vendors/ })).toBeInTheDocument();
  });

  it("gives OWNER_ADMIN's main content the same bottom padding class as the Supervisor's, so the bar never covers a submit button", () => {
    renderOwner();
    expect(screen.getByText("content").closest("main")?.className).toContain("pb-24");
  });
});
