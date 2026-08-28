import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewMaterialPage from "./page";

async function renderNewMaterialPage() {
  const element = await NewMaterialPage();
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("NewMaterialPage", () => {
  it("hides a disabled Category from the picker, but still shows active ones (AC #3)", async () => {
    global.fetch = vi.fn((url: string) => {
      if (String(url).includes("/material-categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: "c1", name: "Pipes & Fittings", isActive: true },
            { id: "c2", name: "Discontinued Category", isActive: false },
          ],
        });
      }
      if (String(url).includes("/units")) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Pcs" }] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    }) as unknown as typeof fetch;

    await renderNewMaterialPage();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open Category options" }));
    expect(await screen.findByRole("option", { name: /Pipes & Fittings/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Discontinued Category/ })).not.toBeInTheDocument();
  });
});
