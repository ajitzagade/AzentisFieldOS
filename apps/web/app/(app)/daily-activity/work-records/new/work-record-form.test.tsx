import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }), useSearchParams: () => new URLSearchParams() }));

import { WorkRecordForm } from "./work-record-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const teamMembers = [
  { id: "tm1", name: "Ravi Kumar" },
  { id: "tm2", name: "Dinesh More" },
];

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  pushMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("WorkRecordForm", () => {
  it("fetches and renders the default crew once a Site is selected (AC #2)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ teamMemberId: "tm1", name: "Ravi Kumar", attended: true }],
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);

    await user.selectOptions(screen.getByLabelText("Site"), "site1");

    await waitFor(() => {
      expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    });
    // Story 1.8: the shared authed-fetch helper always passes an init object
    // (carrying the Authorization header), so the GET now has a second arg.
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/work-records/default-crew?siteId=site1&date="),
      expect.anything(),
    );
  });

  it("shows hours/overtime inputs only for a checked (attended) row, and hides them when unchecked", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ teamMemberId: "tm1", name: "Ravi Kumar", attended: true }],
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");
    await waitFor(() => expect(screen.getByText("Ravi Kumar")).toBeInTheDocument());

    expect(screen.getByLabelText("Hours for Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Ravi Kumar"));

    expect(screen.queryByLabelText("Hours for Ravi Kumar")).not.toBeInTheDocument();
    expect(screen.getByText("Absent")).toBeInTheDocument();
  });

  it("defaults every returned crew member to Present, even one marked absent on the prior date", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { teamMemberId: "tm1", name: "Ravi Kumar", attended: true },
        { teamMemberId: "tm2", name: "Dinesh More", attended: false },
      ],
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");

    await waitFor(() => expect(screen.getByText("Dinesh More")).toBeInTheDocument());
    expect(screen.getAllByText("Present")).toHaveLength(2);
    expect(screen.queryByText("Absent")).not.toBeInTheDocument();
  });

  it("shows a distinct error message, not the generic empty-crew message, when the default-crew fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");

    await waitFor(() => {
      expect(screen.getByText(/Couldn't load the default crew/)).toBeInTheDocument();
    });
    expect(screen.queryByText("No crew defaulted yet")).not.toBeInTheDocument();
  });

  it("adding a Team Member not in the default crew adds them as Present, and removes them from the Add picker", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    await user.selectOptions(screen.getByLabelText("Add Team Member"), "tm2");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Dinesh More")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Dinesh More" })).not.toBeInTheDocument();
  });

  it("posts the batch payload and redirects to /team on success", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ teamMemberId: "tm1", name: "Ravi Kumar", attended: true }] })
      .mockResolvedValueOnce({ ok: true }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");
    await waitFor(() => expect(screen.getByText("Ravi Kumar")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Save Attendance" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith(expect.stringMatching(/^\/team\?flash=/)));
    const batchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1]!;
    expect(batchCall[0]).toContain("/work-records/batch");
    const body = JSON.parse(batchCall[1].body);
    expect(body).toEqual([
      expect.objectContaining({ teamMemberId: "tm1", siteId: "site1", attended: true }),
    ]);
  });

  it("surfaces a 409 conflict message naming the Team Member, instead of failing silently or redirecting", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ teamMemberId: "tm1", name: "Ravi Kumar", attended: true }] })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: "Ravi Kumar already has a Work Record for 2026-08-13" }),
      }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<WorkRecordForm sites={sites} teamMembers={teamMembers} />);
    await user.selectOptions(screen.getByLabelText("Site"), "site1");
    await waitFor(() => expect(screen.getByText("Ravi Kumar")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Save Attendance" }));

    await waitFor(() => {
      expect(screen.getByText("Ravi Kumar already has a Work Record for 2026-08-13")).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
