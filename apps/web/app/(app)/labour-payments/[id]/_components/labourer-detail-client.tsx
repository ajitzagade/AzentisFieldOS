"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, ChevronRightIcon, cn, PlusIcon, WalletIcon } from "@azentisfieldos/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import type { SiteOption } from "../../../_components/site-field";
import { AttendanceFormModal } from "./attendance-form-modal";
import { WeeklyPaymentFormModal } from "./weekly-payment-form-modal";
import { addWeeks, currentWeekStart, weekDates } from "../week-utils";

type LabourShift = "DAY" | "NIGHT";

interface AttendanceRow {
  id: string;
  workDate: string;
  shift: LabourShift;
  isHalfDay: boolean;
  attended: boolean;
  perDayAmount: number;
  site: { name: string };
}

interface AttendanceModalTarget {
  date: string;
  shift: LabourShift;
}

export interface WeeklyPaymentLedgerRow {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  totalEarned: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
  paidAt: string | null;
  advanceAdjustments: { amount: number }[];
}

// User-requested (2026-09-24): there was previously no way to see an
// Advance's own note (why it was given) or which weekly Payment settled it —
// only a bare id/amount/givenAt dropdown inside the payment modal.
export interface AdvanceHistoryRow {
  id: string;
  amount: number;
  description: string | null;
  givenAt: string;
  adjustments: {
    id: string;
    amount: number;
    note: string | null;
    adjustedAt: string;
    payment: { weekStartDate: string; weekEndDate: string } | null;
  }[];
}

const STATUS_VARIANT: Record<WeeklyPaymentLedgerRow["status"], "success" | "warning" | "danger"> = {
  PAID: "success",
  PARTIAL: "warning",
  UNPAID: "danger",
};

function toNum(value: unknown): number {
  const maybeDecimal = value as { toNumber?: () => number };
  return typeof maybeDecimal?.toNumber === "function" ? maybeDecimal.toNumber() : Number(value);
}

export function LabourerDetailClient({
  labourerId,
  labourerName,
  category,
  defaultPerDayAmount,
  outstandingBalance,
  sites,
  advances,
  ledger,
}: {
  labourerId: string;
  labourerName: string;
  category: string;
  defaultPerDayAmount: number | null;
  outstandingBalance: number;
  sites: SiteOption[];
  advances: AdvanceHistoryRow[];
  ledger: WeeklyPaymentLedgerRow[];
}) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const [weekStart, setWeekStart] = useState(() => currentWeekStart());
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState<AttendanceModalTarget | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<"payments" | "advances">("payments");

  const days = useMemo(() => weekDates(weekStart), [weekStart]);
  const weekEnd = days[6]!;

  const loadAttendance = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      try {
        const res = await authedFetch(
          `/daily-labour-attendance?labourerId=${labourerId}&from=${weekStart}&to=${weekEnd}`,
          { signal },
        );
        if (!res.ok) throw new Error(`Failed to load attendance (${res.status})`);
        const data = (await res.json()) as AttendanceRow[];
        if (!signal.aborted) setAttendance(data);
      } catch {
        if (!signal.aborted) setAttendance([]);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [authedFetch, labourerId, weekStart, weekEnd],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches the visible week's attendance on mount and every week-navigation change, mirroring MeasurementQuickEntryPanel's own on-open fetch effect
    loadAttendance(controller.signal);
    return () => controller.abort();
  }, [loadAttendance]);

  // The API returns workDate as a full ISO datetime string
  // ("2026-09-21T00:00:00.000Z") — `days` are plain "YYYY-MM-DD", so this
  // must slice to the date portion before keying the lookup, or every
  // calendar cell misses its own attendance row. Keyed by date AND shift —
  // the same labourer/date can have an independent Day row and Night row.
  // Value is an ARRAY, not a single row: the backend's duplicate-shift guard
  // is scoped per (labourerId, siteId, workDate, shift), so the same
  // labourer can legitimately have multiple Day (or Night) rows on one date
  // as long as each is at a different Site — a single-row map would only
  // ever surface one of them and silently hide the rest.
  const attendanceByDate = new Map<string, AttendanceRow[]>();
  for (const a of attendance) {
    const key = `${a.workDate.slice(0, 10)}::${a.shift}`;
    const existing = attendanceByDate.get(key);
    if (existing) existing.push(a);
    else attendanceByDate.set(key, [a]);
  }
  const totalEarnedThisWeek = attendance
    .filter((a) => a.attended)
    .reduce((sum, a) => sum + toNum(a.perDayAmount), 0);

  function refreshAfterSave() {
    router.refresh();
    loadAttendance(new AbortController().signal);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">{labourerName}</h1>
          <p className="text-body-sm text-ink-500">{category}</p>
        </div>
        <div className="rounded-md bg-surface-2 px-4 py-2 text-right">
          <div className="text-caption text-ink-500">Outstanding Advance</div>
          <div className="text-card-title font-semibold text-gold-700">{formatMoney(outstandingBalance)}</div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setWeekStart((w) => addWeeks(w, -1))}>
              <ChevronRightIcon className="size-4 rotate-180" />
              Previous week
            </Button>
            <span className="text-body-sm font-medium text-ink-900">
              {formatDate(weekStart)} – {formatDate(weekEnd)}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={() => setWeekStart((w) => addWeeks(w, 1))}>
              Next week
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <Button type="button" onClick={() => setPaymentModalOpen(true)}>
            <WalletIcon className="size-4" />
            Make Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {days.map((day) => (
            <div key={day} className="flex flex-col gap-1.5 rounded-md border border-border-hairline bg-surface-1 p-3">
              <span className="text-caption text-ink-500">{formatDate(day)}</span>
              {(["DAY", "NIGHT"] as const).map((shift) => {
                const rows = attendanceByDate.get(`${day}::${shift}`) ?? [];
                const shiftLabel = shift === "DAY" ? "Day" : "Night";
                return (
                  <div key={shift} className="flex flex-col gap-1">
                    <span className="text-eyebrow font-semibold text-ink-500">{shiftLabel}</span>
                    {rows.map((row) => {
                      const statusLabel = row.attended ? (row.isHalfDay ? ", Present, Half Day" : ", Present") : ", Absent";
                      return (
                        <div
                          key={row.id}
                          aria-label={`${formatDate(day)} — ${shiftLabel} shift at ${row.site.name}${statusLabel}`}
                          className="flex flex-col gap-1 rounded-md border border-border-hairline bg-surface-2 p-2"
                        >
                          <Badge variant={row.attended ? "success" : "danger"}>
                            {row.attended ? (row.isHalfDay ? "Present · Half Day" : "Present") : "Absent"}
                          </Badge>
                          <span className="text-body-sm font-semibold text-ink-900">{formatMoney(toNum(row.perDayAmount))}</span>
                          <span className="text-caption text-ink-500">{row.site.name}</span>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setAttendanceModal({ date: day, shift })}
                      aria-label={`${formatDate(day)} — record ${shiftLabel} shift${rows.length > 0 ? " at another Site" : ""}`}
                      className="flex items-center gap-1 rounded-md border border-border-hairline bg-surface-2 p-2 text-left text-caption text-ink-500 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:bg-surface-3"
                    >
                      <PlusIcon className="size-3" />
                      {rows.length > 0 ? "Record another Site" : "Record"}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {loading ? <p className="mt-2 text-caption text-ink-500">Loading…</p> : null}
        <p className="mt-3 text-body-sm text-ink-700">
          Weekly payable so far: <span className="font-semibold">{formatMoney(totalEarnedThisWeek)}</span>
        </p>
      </div>

      <div>
        <div className="mb-3 flex gap-2" role="tablist" aria-label="Labourer history">
          {(
            [
              { key: "payments", label: "Payment History" },
              { key: "advances", label: "Advance History" },
            ] as const
          ).map((tab) => {
            const active = historyTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setHistoryTab(tab.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-body-sm font-semibold transition-colors duration-fast ease-(--ease-standard)",
                  active
                    ? "border-accent-teal-700 bg-accent-teal-700 text-white"
                    : "border-border-hairline bg-surface-1 text-ink-700 hover:bg-surface-2",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {historyTab === "payments" ? (
          ledger.length === 0 ? (
            <p className="text-body-sm text-ink-500">No weekly payments recorded yet for this Labourer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-body-sm">
                <thead>
                  <tr className="border-b border-border-hairline text-caption text-ink-500">
                    <th className="py-2 pr-4 text-left">Week</th>
                    <th className="py-2 px-4 text-right">Total Earned</th>
                    <th className="py-2 px-4 text-right">Advance Adjusted</th>
                    <th className="py-2 px-4 text-right">Amount Paid</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 pl-4 text-left">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => {
                    const adjusted = row.advanceAdjustments.reduce((sum, a) => sum + toNum(a.amount), 0);
                    return (
                      <tr key={row.id} className="border-b border-border-hairline last:border-b-0">
                        <td className="py-2 pr-4">
                          {formatDate(row.weekStartDate)} – {formatDate(row.weekEndDate)}
                        </td>
                        <td className="py-2 px-4 text-right">{formatMoney(toNum(row.totalEarned))}</td>
                        <td className="py-2 px-4 text-right">{adjusted !== 0 ? formatMoney(adjusted) : "—"}</td>
                        <td className="py-2 px-4 text-right font-semibold text-gold-700">{formatMoney(toNum(row.amountPaid))}</td>
                        <td className="py-2 px-4">
                          <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                        </td>
                        <td className="py-2 pl-4">{row.paidAt ? formatDate(row.paidAt) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : advances.length === 0 ? (
          <p className="text-body-sm text-ink-500">No advances recorded yet for this Labourer.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {advances.map((advance) => {
              const adjustedTotal = advance.adjustments.reduce((sum, a) => sum + toNum(a.amount), 0);
              const remaining = toNum(advance.amount) - adjustedTotal;
              return (
                <div key={advance.id} className="rounded-md border border-border-hairline bg-surface-1 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-body-sm font-semibold text-ink-900">{formatMoney(toNum(advance.amount))}</span>
                    <span className="text-caption text-ink-500">Given {formatDate(advance.givenAt)}</span>
                  </div>
                  {advance.description ? <p className="mt-1 text-body-sm text-ink-700">{advance.description}</p> : null}
                  <p className="mt-1 text-caption text-ink-500">
                    {remaining > 0 ? `${formatMoney(remaining)} outstanding` : "Fully settled"}
                  </p>
                  {advance.adjustments.length > 0 ? (
                    <ul className="mt-2 flex flex-col gap-1 border-t border-border-hairline pt-2">
                      {advance.adjustments.map((adj) => (
                        <li key={adj.id} className="flex flex-wrap items-baseline justify-between gap-2 text-caption text-ink-500">
                          <span>
                            {formatMoney(toNum(adj.amount))} adjusted
                            {adj.payment
                              ? ` against ${formatDate(adj.payment.weekStartDate)} – ${formatDate(adj.payment.weekEndDate)}`
                              : ""}
                            {adj.note ? ` — ${adj.note}` : ""}
                          </span>
                          <span>{formatDate(adj.adjustedAt)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {attendanceModal ? (
        <AttendanceFormModal
          open={attendanceModal !== null}
          onOpenChange={(open) => setAttendanceModal(open ? attendanceModal : null)}
          labourerId={labourerId}
          defaultPerDayAmount={defaultPerDayAmount}
          workDate={attendanceModal.date}
          shift={attendanceModal.shift}
          sites={sites}
          onSuccess={() => {
            setAttendanceModal(null);
            refreshAfterSave();
          }}
        />
      ) : null}

      <WeeklyPaymentFormModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        labourerId={labourerId}
        weekStartDate={weekStart}
        weekLabel={`${formatDate(weekStart)} – ${formatDate(weekEnd)}`}
        totalEarned={totalEarnedThisWeek}
        outstandingBalance={outstandingBalance}
        advances={advances}
        onSuccess={() => {
          setPaymentModalOpen(false);
          refreshAfterSave();
        }}
      />
    </div>
  );
}
