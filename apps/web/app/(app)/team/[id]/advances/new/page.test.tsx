import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import NewAdvancePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  teamMember?: unknown;
  teamMemberStatus?: number;
  role?: "OWNER_ADMIN" | "SITE_SUPERVISOR";
}) {
  global.fetch = vi.fn((url: string) => {
    if (String(url).includes("/users/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ role: handlers.role ?? "OWNER_ADMIN" }),
      });
    }
    return Promise.resolve({
      ok: (handlers.teamMemberStatus ?? 200) < 400,
      status: handlers.teamMemberStatus ?? 200,
      json: async () => handlers.teamMember,
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderNewAdvancePage(id: string) {
  const element = await NewAdvancePage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("NewAdvancePage", () => {
  it("renders the Advance form with a breadcrumb back to the Team Member", async () => {
    mockFetchRouter({ teamMember: { id: "tm1", name: "Ravi Kumar" } });

    await renderNewAdvancePage("tm1");

    expect(screen.getByRole("heading", { name: "Record an Advance" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ravi Kumar" })).toHaveAttribute("href", "/team/tm1");
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("calls notFound() for a Team Member ID that does not exist", async () => {
    mockFetchRouter({ teamMemberStatus: 404, teamMember: undefined });

    await expect(renderNewAdvancePage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("404s for SITE_SUPERVISOR, since apps/api now rejects that write", async () => {
    mockFetchRouter({ teamMember: { id: "tm1", name: "Ravi Kumar" }, role: "SITE_SUPERVISOR" });

    await expect(renderNewAdvancePage("tm1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
