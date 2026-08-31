import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

import { GlobalSearchButton, GlobalSearchDialog, useGlobalSearchController } from "./global-search";

function Harness() {
  const search = useGlobalSearchController();
  return (
    <>
      <GlobalSearchButton onClick={() => search.setOpen(true)} />
      <GlobalSearchDialog controller={search} />
    </>
  );
}

const RESPONSE = {
  sites: {
    results: [{ id: "s1", name: "Nashik Metro", location: "Nashik", contractReference: null }],
    total: 1,
  },
  materials: {
    results: [{ id: "m1", name: "Cement", category: { id: "c1", name: "Binders" } }],
    total: 1,
  },
};

const originalFetch = global.fetch;

beforeEach(() => {
  pushMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("GlobalSearch", () => {
  it("opens the palette via the Cmd/Ctrl+K keyboard shortcut", async () => {
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("opens via the visible button and debounces the fetch while typing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => RESPONSE });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "nashik" } });

    expect(fetchMock).not.toHaveBeenCalled();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 1000 });
    const calledUrl = fetchMock.mock.calls[0]![0] as string;
    expect(calledUrl).toContain("/search?q=nashik");
  });

  it("navigates to the Site detail page and closes when a Site result is selected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => RESPONSE });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.change(await screen.findByRole("textbox"), { target: { value: "nashik" } });

    fireEvent.click(await screen.findByText("Nashik Metro", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/sites/s1");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("navigates to the Material's cross-Site availability page when a Material result is selected (Story 16.3)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => RESPONSE });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.change(await screen.findByRole("textbox"), { target: { value: "cement" } });

    fireEvent.click(await screen.findByText("Cement", {}, { timeout: 1000 }));

    expect(pushMock).toHaveBeenCalledWith("/materials/m1/availability");
  });

  it('navigates to the filtered Sites list when "See all" is chosen, carrying the query', async () => {
    const manySites = {
      sites: {
        results: [{ id: "s1", name: "Nashik Metro", location: "Nashik", contractReference: null }],
        total: 12,
      },
      materials: { results: [], total: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => manySites });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    fireEvent.change(await screen.findByRole("textbox"), { target: { value: "nashik" } });

    fireEvent.click(
      await screen.findByRole("button", { name: /see all 12 results/i }, { timeout: 1000 }),
    );

    expect(pushMock).toHaveBeenCalledWith("/sites?q=nashik");
  });
});
