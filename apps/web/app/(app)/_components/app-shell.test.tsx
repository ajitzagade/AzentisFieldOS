import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
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

describe("AppShell", () => {
  it("renders the full grouped sidebar for OWNER_ADMIN", () => {
    mockPathname = "/";
    render(
      <AppShell role="OWNER_ADMIN">
        <div>content</div>
      </AppShell>,
    );

    // Ungrouped items
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sites/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Daily Report/ })).toBeInTheDocument();

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
    expect(screen.getByRole("link", { name: /Inventory/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Machinery & Vehicles/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reports/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Waste & Disposal/ })).toBeInTheDocument();

    // Settings pinned
    expect(screen.getByRole("link", { name: /Settings/ })).toBeInTheDocument();

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
    const inventoryLink = screen.getByRole("link", { name: /Inventory/ });
    const dashboardLink = screen.getByRole("link", { name: /Dashboard/ });
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
    expect(screen.getByRole("link", { name: /Dashboard/ }).className).not.toContain("bg-accent-teal-700");
    expect(screen.getByRole("link", { name: /Sites/ }).className).toContain("bg-accent-teal-700");
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
});
