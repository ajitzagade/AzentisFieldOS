import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardSearchButton } from "./dashboard-search-button";
import { GlobalSearchContext } from "./global-search";

describe("DashboardSearchButton", () => {
  it('renders a "Search ⌘K" ghost chip that calls the context\'s open() on click', () => {
    const open = vi.fn();
    render(
      <GlobalSearchContext.Provider value={{ open }}>
        <DashboardSearchButton />
      </GlobalSearchContext.Provider>,
    );

    const button = screen.getByRole("button", { name: /Search/ });
    expect(button).toHaveTextContent("Search ⌘K");
    expect(open).not.toHaveBeenCalled();

    fireEvent.click(button);

    expect(open).toHaveBeenCalledTimes(1);
  });

  // Story 19.3's I/O matrix: a dev-time error, not a silent no-op, if this
  // is ever rendered outside app-shell.tsx's provider.
  it("throws a clear error when rendered outside GlobalSearchContext's provider", () => {
    // React logs the thrown error to the console during render — suppress
    // that expected noise so the test output stays clean.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<DashboardSearchButton />)).toThrow(
      /useOpenGlobalSearch must be used within/,
    );

    consoleError.mockRestore();
  });
});
