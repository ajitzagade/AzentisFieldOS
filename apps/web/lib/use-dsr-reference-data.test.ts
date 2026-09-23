import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const authedFetchMock = vi.fn();
vi.mock("./use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mock above (vi.mock is hoisted) so the hook's own
// useAuthedFetch() call resolves to the mock.
import { useDsrReferenceData } from "./use-dsr-reference-data";

function ok(body: unknown) {
  return Promise.resolve({ ok: true, json: async () => body });
}

// spec-dsr-labour-dropdown: labourerOptions/addLabourerOption — same shape
// and behavior as subcontractorOptions/addSubcontractorOption.
describe("useDsrReferenceData — labourerOptions (spec-dsr-labour-dropdown)", () => {
  it("fetches /daily-labourers?isActive=true and maps id/name/category into value/label/description", async () => {
    authedFetchMock.mockImplementation((path: string) => {
      if (path === "/daily-labourers?isActive=true") {
        return ok([
          { id: "l1", name: "Ramesh", category: "Mistri" },
          { id: "l2", name: "Sita", category: "Women" },
        ]);
      }
      return ok([]);
    });

    const { result } = renderHook(() => useDsrReferenceData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.labourerOptions).toEqual([
      { value: "l1", label: "Ramesh", description: "Mistri" },
      { value: "l2", label: "Sita", description: "Women" },
    ]);
  });

  it("addLabourerOption prepends into labourerOptions without a re-fetch", async () => {
    authedFetchMock.mockImplementation((path: string) => {
      if (path === "/daily-labourers?isActive=true") {
        return ok([{ id: "l1", name: "Ramesh", category: "Mistri" }]);
      }
      return ok([]);
    });

    const { result } = renderHook(() => useDsrReferenceData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.addLabourerOption({
        value: "l2",
        label: "Sita",
        description: "Women",
      });
    });

    expect(result.current.labourerOptions).toEqual([
      { value: "l2", label: "Sita", description: "Women" },
      { value: "l1", label: "Ramesh", description: "Mistri" },
    ]);
  });

  it("labourerOptions is empty (not undefined) when the list load fails", async () => {
    authedFetchMock.mockImplementation(() =>
      Promise.reject(new Error("offline")),
    );

    const { result } = renderHook(() => useDsrReferenceData());

    await waitFor(() => expect(result.current.loadFailed).toBe(true));
    expect(result.current.labourerOptions).toEqual([]);
  });
});
