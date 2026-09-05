import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangleIcon,
  ArrowsIcon,
  BoxIcon,
  CameraIcon,
  Card,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DropletIcon,
  GapFlag,
  GapFlagList,
  LayersIcon,
  ReceiptIcon,
  UsersIcon,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";

// The Site Supervisor's landing surface (simplicity review 2026-09-01):
// task-first, not rollup-first. A supervisor opens the app to DO one of a
// handful of daily things — each is one tap from here, in the plain language
// of the job ("Material Received", not "Purchase"). The Owner's cross-Site
// financial rollup stays on owner-dashboard.tsx; showing it to a field user
// buried their actual work three taps deep behind a hamburger.
//
// Every action here is a link into an existing, unchanged flow — this surface
// adds reachability, it owns no business logic of its own (AD-3).

interface TodayActivity {
  sitesReportingToday: number;
  sitesMissingDsrToday: { siteId: string; name: string }[];
}

// The status strip is additive context — if the read fails transiently the
// task grid must still render (the whole point of this page is starting a
// task), so this degrades to null rather than throwing to the error boundary.
async function getTodaySafe(): Promise<TodayActivity | null> {
  try {
    const res = await authedFetch("/dashboard/today", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TodayActivity;
  } catch {
    return null;
  }
}

interface HomeTask {
  href: string;
  label: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// The primary field tasks, in frequency order. Daily Report is the approved
// "1A" hero — a full-width filled card above the grid, because it is the one
// thing every Supervisor must do every day (SM-2's <5-minute target).
const HERO_TASK: HomeTask = {
  href: "/dsr/new",
  label: "Start Daily Report",
  hint: "Today's work, crew, materials & photos",
  icon: ClipboardIcon,
};

const PRIMARY_TASKS: HomeTask[] = [
  { href: "/movements/purchases/new", label: "Material Received", hint: "New stock arrived at site or Godown", icon: BoxIcon },
  { href: "/movements/godown-to-site/new", label: "Material Sent", hint: "Godown → site, or site → site", icon: ArrowsIcon },
  { href: "/movements/consumption/new", label: "Material Used", hint: "Stock used in today's work", icon: LayersIcon },
  { href: "/daily-activity/work-records/new", label: "Attendance", hint: "Mark who worked today", icon: UsersIcon },
  { href: "/sites", label: "Site Photos", hint: "Open a site to view or add photos", icon: CameraIcon },
];

// Less-frequent entries stay reachable from Home even though they are not in
// the Supervisor's trimmed sidebar — trimming navigation must never remove a
// capability (the API allows these writes for both roles).
const MORE_TASKS: HomeTask[] = [
  { href: "/movements/return-wastage/new", label: "Wastage / Return", hint: "Material returned or wasted", icon: ArrowsIcon },
  { href: "/rmc/new", label: "RMC Delivery", hint: "Ready-mix concrete received", icon: DropletIcon },
  { href: "/expenses/new", label: "Expense", hint: "Money spent at site", icon: ReceiptIcon },
];

export async function SupervisorHome() {
  const today = await getTodaySafe();

  const heading = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });

  const missing = today?.sitesMissingDsrToday ?? [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-page-title text-ink-900">Today</h1>
        <p className="text-body-sm text-ink-500">{heading}</p>
      </div>

      {/* Report status first — the one thing that must not be forgotten today.
          A transient read failure renders nothing here rather than blocking
          the task grid below. */}
      {today !== null ? (
        missing.length > 0 ? (
          // One flag per Site, each deep-linking the form to that Site —
          // never a single banner naming all of them at once (FR-35). Folds
          // behind a summary line once there are several, via GapFlagList.
          <div className="mb-6">
            <GapFlagList
              count={missing.length}
              summary={`Daily Report still due today for ${missing.length} sites`}
            >
              {missing.map((site) => (
                <GapFlag
                  key={site.siteId}
                  icon={<AlertTriangleIcon />}
                  message={`Daily Report still due today for ${site.name}.`}
                  action={
                    <Link
                      href={`/dsr/new?siteId=${site.siteId}`}
                      className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                    >
                      <ClipboardIcon className="size-4" />
                      Start Daily Report
                    </Link>
                  }
                />
              ))}
            </GapFlagList>
          </div>
        ) : today.sitesReportingToday > 0 ? (
          // Success only when at least one Site actually reported — a tenant
          // with zero Sites must not read a false "everything's done".
          <p className="mb-6 flex items-center gap-2 text-body-sm font-medium text-ink-700">
            <CheckCircleIcon className="size-4 shrink-0 text-accent-teal-700" />
            Every site has submitted today&apos;s Daily Report.
          </p>
        ) : null
      ) : null}

      {/* Approved layout 1A: Daily Report as a full-width filled hero card,
          the remaining tasks in a two-up grid below it. */}
      <Link href={HERO_TASK.href} className="block">
        <Card
          interactive
          className="flex items-center gap-3 border-accent-teal-700 bg-accent-teal-700 py-4 text-white"
        >
          <HERO_TASK.icon className="size-6 shrink-0" />
          <div>
            <div className="text-body font-semibold">{HERO_TASK.label}</div>
            <p className="mt-0.5 text-caption text-white/75">{HERO_TASK.hint}</p>
          </div>
        </Card>
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {PRIMARY_TASKS.map((task) => {
          const Icon = task.icon;
          return (
            <Link key={task.href + task.label} href={task.href} className="block">
              <Card interactive className="flex h-full min-h-28 flex-col gap-2">
                <Icon className="size-6 shrink-0 text-accent-teal-700" />
                <div>
                  <div className="text-body font-semibold text-ink-900">{task.label}</div>
                  <p className="mt-0.5 text-caption text-ink-500">{task.hint}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 mb-3 text-section-header text-ink-900">More</h2>
      <div className="flex flex-col gap-2">
        {MORE_TASKS.map((task) => {
          const Icon = task.icon;
          return (
            <Link key={task.href} href={task.href} className="block">
              <Card interactive className="flex items-center gap-3 py-3">
                <Icon className="size-5 shrink-0 text-ink-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-body-sm font-semibold text-ink-900">{task.label}</div>
                  <p className="text-caption text-ink-500">{task.hint}</p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-ink-500" />
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
