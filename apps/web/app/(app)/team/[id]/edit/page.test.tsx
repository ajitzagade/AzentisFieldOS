import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditTeamMemberPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { teamMember?: unknown; teamMemberStatus?: number; employmentTypes?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/team-members/")) {
      return Promise.resolve({
        ok: (handlers.teamMemberStatus ?? 200) < 400,
        status: handlers.teamMemberStatus ?? 200,
        json: async () => handlers.teamMember,
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.employmentTypes ?? [] });
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

async function renderEditPage(id: string) {
  const element = await EditTeamMemberPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("EditTeamMemberPage", () => {
  it("fetches the Team Member by id via the dedicated detail endpoint and renders its edit form", async () => {
    mockFetchRouter({
      teamMember: {
        id: "tm1",
        name: "Ravi Kumar",
        designation: null,
        contact: null,
        isActive: true,
        employmentType: { id: "e1", name: "Weekly" },
      },
      employmentTypes: [{ id: "e1", name: "Weekly", isActive: true }],
    });

    await renderEditPage("tm1");

    expect(screen.getByLabelText("Name")).toHaveValue("Ravi Kumar");
  });

  it("calls notFound() for a Team Member ID that does not exist", async () => {
    mockFetchRouter({ teamMemberStatus: 404, teamMember: undefined, employmentTypes: [] });

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("keeps the Team Member's own current Employment Type selectable even if it has since been disabled", async () => {
    mockFetchRouter({
      teamMember: {
        id: "tm1",
        name: "Ravi Kumar",
        designation: null,
        contact: null,
        isActive: true,
        employmentType: { id: "e1", name: "Discontinued Type" },
      },
      employmentTypes: [{ id: "e1", name: "Discontinued Type", isActive: false }],
    });

    await renderEditPage("tm1");

    expect(screen.getByRole("option", { name: "Discontinued Type" })).toBeInTheDocument();
  });
});
