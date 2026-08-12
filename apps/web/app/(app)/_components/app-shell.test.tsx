import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
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

  it("renders the minimal top bar, no sidebar, for SITE_SUPERVISOR", () => {
    mockPathname = "/";
    render(
      <AppShell role="SITE_SUPERVISOR">
        <div>content</div>
      </AppShell>,
    );
    expect(screen.queryByRole("link", { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Materials")).not.toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
