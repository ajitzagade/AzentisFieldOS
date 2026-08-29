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
    expect(screen.getByRole("link", { name: /Daily Activity/ })).toBeInTheDocument();

    // Group labels — "Materials" appears twice (the group label and the
    // Material catalog nav item itself), every other group label is unique.
    expect(screen.getAllByText("Materials")).toHaveLength(2);
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();

    // Grouped items
    expect(screen.getByRole("link", { name: /Inventory/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Machinery & Vehicles/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reports/ })).toBeInTheDocument();

    // Settings pinned
    expect(screen.getByRole("link", { name: /Settings/ })).toBeInTheDocument();

    expect(screen.getByText("content")).toBeInTheDocument();
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

  it("renders the sidebar for SITE_SUPERVISOR, but hides the Owner/Admin-only Settings item", () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );
    // Sidebar nav is present for the Supervisor now (same shell as Owner/Admin).
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getAllByText("Materials").length).toBeGreaterThan(0);
    // Settings hard-404s for a Supervisor, so it must not appear as a link.
    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
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
