import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTeamNames } from "./team-names";

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

describe("getTeamNames", () => {
  it("returns active members' names, deduped, with inactive and empty names dropped", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { name: "Suresh Kumar", isActive: true },
        { name: "Suresh Kumar", isActive: true }, // duplicate name — one suggestion suffices
        { name: "Ganesh Jadhav" }, // isActive absent counts as active
        { name: "Old Worker", isActive: false },
        { name: "   ", isActive: true }, // blank
      ],
    }) as unknown as typeof fetch;

    await expect(getTeamNames()).resolves.toEqual(["Suresh Kumar", "Ganesh Jadhav"]);
  });

  it("degrades to an empty list on a failed or malformed read — the form never blocks on suggestions", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(getTeamNames()).resolves.toEqual([]);

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ not: "an array" }) }) as unknown as typeof fetch;
    await expect(getTeamNames()).resolves.toEqual([]);

    global.fetch = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    await expect(getTeamNames()).resolves.toEqual([]);
  });
});
