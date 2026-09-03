"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Badge,
  Button,
  DataTable,
  PlusIcon,
  SelectField,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import {
  REPORT_SCHEDULE_FREQUENCIES,
  REPORT_SCHEDULE_TYPES,
} from "@azentisfieldos/shared";
import {
  createReportScheduleAction,
  toggleReportScheduleAction,
  type CreateReportScheduleFormState,
} from "./actions";

export interface ReportScheduleRow {
  id: string;
  reportType: string;
  frequency: string;
  recipientUserIds: string[];
  enabled: boolean;
  siteId: string | null;
  lastRunAt: string | null;
}

export interface ScheduleUser {
  id: string;
  name: string | null;
  email: string;
  status: "Active" | "Pending";
}

export interface ScheduleSite {
  id: string;
  name: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  SITE: "Site",
  INVENTORY: "Inventory",
  LABOUR: "Labour",
  MACHINERY_VEHICLE: "Machinery / Vehicle",
  FINANCIAL: "Financial",
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

function formatDateTime(iso: string | null) {
  if (!iso) return "Never run";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="mb-4">
      <PlusIcon className="size-4" />
      Add Schedule
    </Button>
  );
}

function ToggleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-caption text-accent-teal-700 underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function ScheduleToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [state, formAction] = useActionState(
    toggleReportScheduleAction.bind(null, id, !enabled),
    {},
  );
  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <ToggleButton label={enabled ? "Pause" : "Resume"} />
      </form>
      {state.formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}
    </div>
  );
}

const initialState: CreateReportScheduleFormState = {};

export function ReportSchedulesManager({
  schedules,
  sites,
  users,
}: {
  schedules: ReportScheduleRow[];
  sites: ScheduleSite[];
  users: ScheduleUser[];
}) {
  const recipients = users.filter((user) => user.status === "Active");
  const siteNameById = new Map(sites.map((s) => [s.id, s.name]));

  const [state, formAction] = useActionState(createReportScheduleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // On success, clear the form via the DOM (no setState in the effect) — the
    // recipient checkboxes are uncontrolled, so form.reset() unchecks them too.
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));

  const columns: DataTableColumn<ReportScheduleRow>[] = [
    {
      header: "Report",
      cell: (row) => (
        <span className="font-semibold">
          {REPORT_TYPE_LABELS[row.reportType] ?? row.reportType}
        </span>
      ),
    },
    { header: "Frequency", cell: (row) => FREQUENCY_LABELS[row.frequency] ?? row.frequency },
    {
      header: "Site Scope",
      cell: (row) =>
        row.siteId ? (siteNameById.get(row.siteId) ?? "—") : <span className="text-ink-500">All Sites</span>,
    },
    { header: "Recipients", align: "right", cell: (row) => row.recipientUserIds.length },
    {
      header: "Last Run",
      cell: (row) => <span className="text-ink-500">{formatDateTime(row.lastRunAt)}</span>,
    },
    {
      header: "Status",
      cell: (row) =>
        row.enabled ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Paused</Badge>,
    },
    { header: "", align: "right", cell: (row) => <ScheduleToggle id={row.id} enabled={row.enabled} /> },
  ];

  return (
    <div className="flex flex-col gap-8">
      <form
        ref={formRef}
        action={formAction}
        noValidate
        className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface-1 p-5"
      >
        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-3">
          <SelectField
            label="Report type"
            name="reportType"
            defaultValue={REPORT_SCHEDULE_TYPES[0]}
            options={REPORT_SCHEDULE_TYPES.map((t) => ({ value: t, label: REPORT_TYPE_LABELS[t] ?? t }))}
            error={state.errors?.reportType?.[0]}
          />
          <SelectField
            label="Frequency"
            name="frequency"
            defaultValue={REPORT_SCHEDULE_FREQUENCIES[0]}
            options={REPORT_SCHEDULE_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABELS[f] ?? f }))}
            error={state.errors?.frequency?.[0]}
          />
          <SelectField
            label="Site scope"
            name="siteId"
            defaultValue=""
            options={[
              { value: "", label: "All Sites" },
              ...sites.map((site) => ({ value: site.id, label: site.name })),
            ]}
            error={state.errors?.siteId?.[0]}
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-caption font-semibold text-ink-700">Recipients</legend>
          {recipients.length === 0 ? (
            <p className="text-caption text-ink-500">
              No active users to choose from yet — invite a teammate in Settings.
            </p>
          ) : (
            recipients.map((user) => (
              <label key={user.id} className="flex items-center gap-2 text-body-sm text-ink-700">
                <input
                  type="checkbox"
                  name="recipientUserIds"
                  value={user.id}
                  className="size-4 rounded border-border-hairline"
                />
                <span className="min-w-0 break-words">
                  {user.name ?? user.email} <span className="break-all text-ink-500">({user.email})</span>
                </span>
              </label>
            ))
          )}
          {state.errors?.recipientUserIds?.[0] ? (
            <p role="alert" className="text-caption text-danger-700">
              {state.errors.recipientUserIds[0]}
            </p>
          ) : null}
        </fieldset>

        <div className="flex items-center gap-3">
          <SubmitButton />
          {state.formError ? (
            <p role="alert" className="text-caption text-danger-700">
              {state.formError}
            </p>
          ) : null}
        </div>
      </form>

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          schedules.length === 0
            ? {
                status: "empty",
                message:
                  "No scheduled reports yet. Add one above to have it compiled and delivered on your chosen cadence, independently of the daily report.",
              }
            : { status: "success", rows: schedules }
        }
      />
    </div>
  );
}
