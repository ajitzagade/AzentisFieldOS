import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { CheckCircleIcon } from "@azentisfieldos/ui";

// Story 13.1: the branded report-preview "document" card (mockup 16-reports's
// .report-preview). It renders the STORED `content` snapshot exactly as it was
// compiled/delivered — it never re-fetches or re-renders live DSR data (the
// denormalization guarantee in the DailyReport schema comment). There is
// deliberately NO "Send Report" control here (UX-DR19).

interface ReportContent {
  siteName: string;
  reportDate: string;
  branding: { tenantName: string; logoUrl: string | null; primaryColor: string };
  work: {
    completed: string | null;
    inProgress: string | null;
    planned: string | null;
    issuesBlockers: string | null;
    safetyObservations: string | null;
    notes: string | null;
  };
  labour: { present: number; total: number };
  materials: { material: string; size: string; quantity: number; unit: string }[];
  rmc: { loads: number; totalQuantityM3: number; grades: string[] };
  equipmentUsed: string[];
  expenses: { total: number };
  photos: { count: number };
}

interface DeliveryRow {
  channel: string;
  status: string;
  deliveredAt: string | null;
  lastError: string | null;
}

interface DailyReportDetail {
  id: string;
  reportDate: string;
  generatedAt: string;
  content: ReportContent;
  site: { id: string; name: string };
  deliveries: DeliveryRow[];
}

async function getReport(id: string): Promise<DailyReportDetail | null> {
  const res = await authedFetch(`/reports/daily/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load report (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function channelLabel(channel: string) {
  if (channel === "IN_APP") return "In-app";
  if (channel === "WHATSAPP") return "WhatsApp";
  if (channel === "EMAIL") return "Email";
  return channel;
}

function ReportSection({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border-hairline py-3 last:border-b-0">
      <div className="text-eyebrow uppercase text-ink-500">{label}</div>
      <div className="mt-1 text-body-sm text-ink-900">{value}</div>
    </div>
  );
}

export default async function DailyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/reports" className="text-body-sm text-accent-teal-700 hover:underline">
          ← Back to Reports
        </Link>
        <p className="mt-6 text-body-sm text-ink-500">This report could not be found.</p>
      </div>
    );
  }

  const { content } = report;
  const materials =
    content.materials.length > 0
      ? content.materials
          .map((m) => `${m.material} (${m.size}) — ${m.quantity} ${m.unit}`)
          .join("  ·  ")
      : "None recorded";
  const rmc =
    content.rmc.loads > 0
      ? `${content.rmc.loads} load(s), ${content.rmc.grades.join(", ")} — ${content.rmc.totalQuantityM3} m³ total`
      : "None recorded";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/reports" className="text-body-sm text-accent-teal-700 hover:underline">
        ← Back to Reports
      </Link>

      <div className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface-1 shadow-3">
        {/* Branded header — wordmark/logo + Tenant branding snapshot */}
        <div className="flex items-center gap-3 bg-accent-navy-800 px-6 py-5 text-ink-on-accent">
          {content.branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- runtime tenant logo, not a build-time asset
            <img
              src={content.branding.logoUrl}
              alt={`${content.branding.tenantName} logo`}
              className="size-8 rounded-md object-contain"
            />
          ) : (
            <div
              className="flex size-8 items-center justify-center rounded-md text-body-sm font-bold text-white"
              // Data-driven per-tenant brand color (not a design-token literal):
              // white-labeling requires applying the stored hex at runtime.
              style={{ backgroundColor: content.branding.primaryColor }}
            >
              {content.branding.tenantName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-card-title font-bold">{content.branding.tenantName}</div>
            <div className="text-caption text-ink-500">Daily Site Report</div>
          </div>
        </div>

        {/* Body — the stored content snapshot */}
        <div className="px-6 py-6">
          <div className="mb-5 text-body-sm text-ink-500">
            {content.siteName} &nbsp;·&nbsp; {formatDate(report.reportDate)}
          </div>

          <ReportSection label="Work Completed" value={content.work.completed ?? "—"} />
          <ReportSection
            label="Labour Count"
            value={`${content.labour.present} present of ${content.labour.total} recorded`}
          />
          <ReportSection label="Materials Consumed" value={materials} />
          <ReportSection label="RMC Delivered" value={rmc} />
          <ReportSection
            label="Expenses Logged"
            value={`₹${content.expenses.total.toLocaleString("en-IN")}`}
          />
          <ReportSection
            label="Equipment Used"
            value={content.equipmentUsed.length > 0 ? content.equipmentUsed.join(", ") : "None recorded"}
          />
          <ReportSection label="Site Photos" value={`${content.photos.count} attached`} />
        </div>

        {/* Footer — delivery confirmation per channel (AC #2/#3) */}
        <div className="border-t border-border-hairline bg-surface-2 px-6 py-4">
          <ul className="flex flex-col gap-1">
            {report.deliveries.map((delivery) => (
              <li key={delivery.channel} className="flex items-center gap-2 text-body-sm text-ink-500">
                {delivery.status === "SENT" ? (
                  <CheckCircleIcon className="size-3.5 shrink-0 text-success-700" />
                ) : null}
                <span>
                  {channelLabel(delivery.channel)} —{" "}
                  {delivery.status === "SENT"
                    ? `Delivered${delivery.deliveredAt ? ` at ${new Date(delivery.deliveredAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}`
                    : delivery.status === "FAILED"
                      ? `Failed${delivery.lastError ? `: ${delivery.lastError}` : ""}`
                      : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
