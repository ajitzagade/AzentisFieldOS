import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewTeamMemberPage from "./page";

async function renderNewTeamMemberPage() {
  const element = await NewTeamMemberPage();
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

describe("NewTeamMemberPage", () => {
  it("hides a disabled Employment Type from the picker, but still shows active ones", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "e1", name: "Monthly", isActive: true },
        { id: "e2", name: "Discontinued Type", isActive: false },
      ],
    }) as unknown as typeof fetch;

    await renderNewTeamMemberPage();

    expect(screen.getByRole("option", { name: "Monthly" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Discontinued Type" })).not.toBeInTheDocument();
  });
});
