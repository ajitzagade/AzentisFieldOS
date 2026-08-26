import Link from "next/link";
import { notFound } from "next/navigation";
import { authedFetch } from "@/lib/api";
import type { Role } from "@azentisfieldos/shared";
import { CalendarIcon } from "@azentisfieldos/ui";
import {
  ReportSchedulesManager,
  type ReportScheduleRow,
  type ScheduleSite,
  type ScheduleUser,
} from "./report-schedules-manager";

async function getJSON<T>(path: string): Promise<T> {
  const res = await authedFetch(`${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json();
}

// Story 14.5 (FR-51): scheduled reports are an Owner/Admin configuration surface
// (GET /report-schedules is @Roles('OWNER_ADMIN') — a Site Supervisor calling it
// gets 403). Guard the page too so a directly-typed URL 404s rather than
// rendering a broken shell, matching the Settings page pattern.
export default async function ReportSchedulesPage() {
  const me = await getJSON<{ role: Role }>("/users/me");
  if (me.role !== "OWNER_ADMIN") notFound();

  const [schedules, sites, users] = await Promise.all([
    getJSON<ReportScheduleRow[]>("/report-schedules"),
    getJSON<ScheduleSite[]>("/sites"),
    getJSON<ScheduleUser[]>("/users"),
  ]);

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/reports" className="hover:text-accent-teal-700 hover:underline">
          Reports
        </Link>{" "}
        / Scheduled Reports
      </div>
      <div className="mb-8 flex items-center gap-2">
        <CalendarIcon className="size-5 text-accent-teal-700" />
        <div>
          <h1 className="text-page-title text-ink-900">Scheduled Reports</h1>
          <p className="text-body-sm text-ink-500">
            Configure report type, cadence, and recipients. These run independently of the daily
            report delivery — tuning them never affects the core daily flow.
          </p>
        </div>
      </div>

      <ReportSchedulesManager schedules={schedules} sites={sites} users={users} />
    </>
  );
}
