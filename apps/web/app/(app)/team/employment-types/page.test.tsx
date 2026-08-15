import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EmploymentTypesPage from "./page";

async function renderEmploymentTypesPage() {
  const element = await EmploymentTypesPage();
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

describe("EmploymentTypesPage", () => {
  it("renders every Employment Type", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "e1", name: "Monthly", isActive: true },
        { id: "e2", name: "Daily Wage", isActive: true },
      ],
    }) as unknown as typeof fetch;

    await renderEmploymentTypesPage();

    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Daily Wage")).toBeInTheDocument();
  });

  it("renders the empty state when there are zero Employment Types", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderEmploymentTypesPage();

    expect(screen.getByText("No Employment Types yet.")).toBeInTheDocument();
  });
});
