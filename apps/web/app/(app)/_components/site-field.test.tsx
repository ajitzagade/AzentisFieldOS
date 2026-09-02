import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteField, clearRememberedSite } from "./site-field";

// The device-remembered Site is this component's reason to exist (D5) — pin
// the remember/recall/precedence contract so it can't silently regress.
const sites = [
  { id: "site-1", name: "NH-48 Highway Widening" },
  { id: "site-2", name: "Metro Depot" },
];

const KEY = "azentisfieldos:last-site-id";

function hiddenInput(container: HTMLElement, name = "siteId") {
  return container.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SiteField", () => {
  it("submits the picked Site through the hidden input and remembers it on-device", async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteField sites={sites} />);

    await user.type(screen.getByLabelText("Site"), "Metro");
    await user.click(await screen.findByText("Metro Depot"));

    expect(hiddenInput(container)).toHaveValue("site-2");
    expect(window.localStorage.getItem(KEY)).toBe("site-2");
  });

  it("applies the remembered Site on a fresh mount, tells the parent, and says so", () => {
    window.localStorage.setItem(KEY, "site-1");
    const onSiteChange = vi.fn();
    const { container } = render(<SiteField sites={sites} onSiteChange={onSiteChange} />);

    expect(hiddenInput(container)).toHaveValue("site-1");
    expect(screen.getByLabelText("Site")).toHaveValue("NH-48 Highway Widening");
    expect(screen.getByText("Remembered from your last entry")).toBeInTheDocument();
    expect(onSiteChange).toHaveBeenCalledWith("site-1");
  });

  it("an explicit initialSiteId (deep link) beats the remembered Site", () => {
    window.localStorage.setItem(KEY, "site-1");
    const { container } = render(<SiteField sites={sites} initialSiteId="site-2" />);

    expect(hiddenInput(container)).toHaveValue("site-2");
    expect(screen.queryByText("Remembered from your last entry")).not.toBeInTheDocument();
  });

  it("ignores a remembered Site that no longer exists in the options", () => {
    window.localStorage.setItem(KEY, "deleted-site");
    const { container } = render(<SiteField sites={sites} />);

    expect(hiddenInput(container)).toHaveValue("");
  });

  it("ignores a stale deep-linked Site instead of silently submitting an invalid id", () => {
    const { container } = render(<SiteField sites={sites} initialSiteId="deleted-site" />);

    expect(hiddenInput(container)).toHaveValue("");
    expect(screen.getByLabelText("Site")).toHaveValue("");
  });

  it("remember={false} never applies or writes the device default", async () => {
    window.localStorage.setItem(KEY, "site-1");
    const user = userEvent.setup();
    const { container } = render(<SiteField sites={sites} remember={false} name="sourceSiteId" />);

    expect(hiddenInput(container, "sourceSiteId")).toHaveValue("");
    await user.type(screen.getByLabelText("Site"), "Metro");
    await user.click(await screen.findByText("Metro Depot"));
    expect(window.localStorage.getItem(KEY)).toBe("site-1");
  });

  it("clearRememberedSite wipes the device default (sign-out on a shared phone)", () => {
    window.localStorage.setItem(KEY, "site-1");
    clearRememberedSite();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
