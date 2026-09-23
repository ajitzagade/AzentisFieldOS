import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { currentWeekStart } from "../week-utils";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const attendanceFetchMock = vi.fn();
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => attendanceFetchMock,
}));

const createAttendanceActionMock = vi.fn();
const createWeeklyPaymentActionMock = vi.fn();
vi.mock("../actions", () => ({
  createAttendanceAction: (...args: unknown[]) => createAttendanceActionMock(...args),
  createWeeklyPaymentAction: (...args: unknown[]) => createWeeklyPaymentActionMock(...args),
}));

import { LabourerDetailClient } from "./labourer-detail-client";

const sites = [{ id: "site-1", name: "NH-48" }];

function renderClient(overrides: Partial<Parameters<typeof LabourerDetailClient>[0]> = {}) {
  return render(
    <LabourerDetailClient
      labourerId="l1"
      labourerName="Ramesh Kumar"
      category="Mason"
      defaultPerDayAmount={800}
      outstandingBalance={500}
      sites={sites}
      advances={[]}
      ledger={[]}
      {...overrides}
    />,
  );
}

describe("LabourerDetailClient", () => {
  beforeEach(() => {
    refreshMock.mockClear();
    createAttendanceActionMock.mockClear();
    createWeeklyPaymentActionMock.mockClear();
    attendanceFetchMock.mockReset();
    attendanceFetchMock.mockResolvedValue({ ok: true, json: async () => [] });
  });

  it("renders the Labourer's name, category, and outstanding balance", async () => {
    renderClient();

    expect(screen.getByRole("heading", { name: "Ramesh Kumar" })).toBeInTheDocument();
    expect(screen.getByText("Mason")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    await waitFor(() => expect(attendanceFetchMock).toHaveBeenCalled());
  });

  it("fetches the current week's attendance for this Labourer on mount", async () => {
    renderClient();

    await waitFor(() =>
      expect(attendanceFetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/daily-labour-attendance?labourerId=l1&from=${currentWeekStart()}`),
        expect.anything(),
      ),
    );
  });

  it("shows Make Payment regardless of role — both roles manage Labour Payment end to end", async () => {
    renderClient();
    expect(screen.getByRole("button", { name: /Make Payment/ })).toBeInTheDocument();
  });

  it("opens the attendance modal for a day with no existing entry, pre-filled with that date", async () => {
    const user = userEvent.setup();
    renderClient();
    await waitFor(() => expect(attendanceFetchMock).toHaveBeenCalled());

    const dayButtons = screen.getAllByText("Record");
    await user.click(dayButtons[0]!.closest("button")!);

    expect(await screen.findByRole("dialog", { name: "Record Attendance" })).toBeInTheDocument();
  });

  // Regression: the only prior click-interaction test clicked the first
  // ("Record") button in DOM order, which is always the Day sub-cell — so
  // nothing proved the Night sub-cell actually wires shift: "NIGHT" through.
  // Each day cell renders Day then Night, so index 1 is the first day's
  // Night sub-cell.
  it("opens the attendance modal scoped to Night shift when the Night sub-cell is clicked", async () => {
    const user = userEvent.setup();
    renderClient();
    await waitFor(() => expect(attendanceFetchMock).toHaveBeenCalled());

    const dayButtons = screen.getAllByText("Record");
    await user.click(dayButtons[1]!.closest("button")!);

    const dialog = await screen.findByRole("dialog", { name: "Record Attendance" });
    expect(dialog).toHaveTextContent("· Night shift");
  });

  // Regression: the API returns workDate as a full ISO datetime string
  // ("2026-09-21T00:00:00.000Z"), not the plain "YYYY-MM-DD" `days` uses —
  // a real browser run caught the calendar showing every day as empty
  // ("+ Record") even though the row had actually saved, because the
  // lookup key never matched.
  it("shows a day's recorded attendance on the calendar despite the API's ISO-datetime workDate format", async () => {
    attendanceFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "att1",
          workDate: `${currentWeekStart()}T00:00:00.000Z`,
          shift: "DAY",
          isHalfDay: false,
          attended: true,
          perDayAmount: 800,
          site: { name: "Verify Site" },
        },
      ],
    });

    renderClient();

    expect(await screen.findByText("Present")).toBeInTheDocument();
    // Appears twice: the day cell's own amount, and the week total (both
    // ₹800 here since there's only one attended day) — assert at least one.
    expect(screen.getAllByText("₹800").length).toBeGreaterThan(0);
    expect(screen.getByText("Verify Site")).toBeInTheDocument();
    expect(screen.getByText("Weekly payable so far:")).toBeInTheDocument();
    // 7 days x 2 shifts (Day/Night) = 14 sub-rows, minus the one filled Day
    // row above = 13 still showing the empty "Record" affordance.
    expect(screen.getAllByText("Record")).toHaveLength(13);
  });

  // Day/Night shift: the same labourer/date can have an independent Day
  // entry and Night entry, each shown and clickable separately.
  it("shows Day and Night as independently-clickable entries for the same date, and reflects Half Day", async () => {
    attendanceFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "att-day",
          workDate: `${currentWeekStart()}T00:00:00.000Z`,
          shift: "DAY",
          isHalfDay: false,
          attended: true,
          perDayAmount: 800,
          site: { name: "NH-48" },
        },
        {
          id: "att-night",
          workDate: `${currentWeekStart()}T00:00:00.000Z`,
          shift: "NIGHT",
          isHalfDay: true,
          attended: true,
          perDayAmount: 400,
          site: { name: "NH-48" },
        },
      ],
    });

    renderClient();

    expect(await screen.findByText("Present")).toBeInTheDocument();
    expect(screen.getByText("Present · Half Day")).toBeInTheDocument();
    expect(screen.getByText("₹800")).toBeInTheDocument();
    expect(screen.getByText("₹400")).toBeInTheDocument();
    // Weekly payable sums both shifts.
    expect(screen.getByText("₹1,200")).toBeInTheDocument();
  });

  it("navigates to the previous/next week and refetches attendance for the new range", async () => {
    const user = userEvent.setup();
    renderClient();
    await waitFor(() => expect(attendanceFetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: /Previous week/ }));

    await waitFor(() => expect(attendanceFetchMock).toHaveBeenCalledTimes(2));
    const secondCallUrl = attendanceFetchMock.mock.calls[1]?.[0] as string;
    expect(secondCallUrl).not.toContain(`from=${currentWeekStart()}&`);
  });

  it("renders the ledger history with Advance Adjusted derived from advanceAdjustments", () => {
    renderClient({
      ledger: [
        {
          id: "pay1",
          weekStartDate: "2026-08-09",
          weekEndDate: "2026-08-15",
          totalEarned: 4800,
          amountPaid: 4500,
          status: "PARTIAL",
          paidAt: "2026-08-16",
          advanceAdjustments: [{ amount: 300 }],
        },
      ],
    });

    expect(screen.getByText("₹4,800")).toBeInTheDocument();
    expect(screen.getByText("₹300")).toBeInTheDocument();
    expect(screen.getByText("₹4,500")).toBeInTheDocument();
    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
  });

  // Pre-change historical row (I/O matrix): a DailyLabourWeeklyPayment
  // created before the Monday->Sunday anchor swap is Monday-anchored
  // forever (never backfilled/rewritten, AD-9). The ledger's rendering
  // path is anchor-agnostic — it just formats whatever dates are stored —
  // so a legacy row must still render its stored dates unshifted.
  it("renders a pre-change, Monday-anchored ledger row's stored dates unshifted", () => {
    renderClient({
      ledger: [
        {
          id: "pay-legacy",
          weekStartDate: "2026-08-10",
          weekEndDate: "2026-08-16",
          totalEarned: 5600,
          amountPaid: 5600,
          status: "PAID",
          paidAt: "2026-08-17",
          advanceAdjustments: [],
        },
      ],
    });

    expect(screen.getByText("10/Aug/2026 – 16/Aug/2026")).toBeInTheDocument();
  });
});
