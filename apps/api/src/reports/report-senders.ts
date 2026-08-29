import type { ReportContent } from './report-compiler.service';

// Story 13.1 (FR-33): per-channel send adapters behind small interfaces, so
// the external-vendor coupling stays isolated and trivially mockable in the
// delivery-service tests. Nest DI tokens (below) select the concrete impls in
// reports.module.ts.
export const EMAIL_SENDER = 'EMAIL_SENDER';
export const WHATSAPP_SENDER = 'WHATSAPP_SENDER';

export interface EmailSender {
  send(recipients: string[], content: ReportContent): Promise<void>;
}

export interface WhatsAppSender {
  send(recipients: string[], content: ReportContent): Promise<void>;
}

// Escapes free-text before it is interpolated into the server-built email HTML
// string. React auto-escapes the web preview; this hand-built string does not,
// so a DSR value containing `<`, `>`, `&`, `"`, `'` would otherwise break the
// markup or inject content. Every interpolated `content.*` free-text value must
// pass through this.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Minimal HTML rendering of the compiled report for the email body. Kept here
// (not in packages/ui) because it's a server-only email string, not a rendered
// component. Inline styles are the correct, accepted approach for email HTML
// (an intentional exception to AD-4 — email clients strip <style>/classes).
// The header honors the tenant's captured brand color + logo (FR-32 — the
// delivered email is the primary branded artifact recipients see).
export function renderReportEmailHtml(content: ReportContent): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:.05em">${label}</td>` +
    `<td style="padding:6px 12px;color:#1B2430;font-size:14px">${value}</td></tr>`;
  const materials =
    content.materials
      .map(
        (m) =>
          `${escapeHtml(m.material)} (${escapeHtml(m.size)}) — ${m.quantity} ${escapeHtml(m.unit)}`,
      )
      .join('; ') || 'None recorded';
  const rmc =
    content.rmc.loads > 0
      ? `${content.rmc.loads} load(s), ${content.rmc.grades.map(escapeHtml).join(', ')} — ${content.rmc.totalQuantityM3} m³`
      : 'None recorded';
  const brandColor = content.branding.primaryColor;
  const tenantName = escapeHtml(content.branding.tenantName);
  const logo = content.branding.logoUrl
    ? `<img src="${escapeHtml(content.branding.logoUrl)}" alt="${tenantName} logo" width="32" height="32" style="border-radius:6px;object-fit:contain;margin-right:12px;vertical-align:middle" />`
    : '';
  return [
    `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">`,
    `<div style="background:${brandColor};color:#F7F5EE;padding:20px 24px">`,
    logo,
    `<span style="display:inline-block;vertical-align:middle">`,
    `<span style="display:block;font-size:17px;font-weight:700">${tenantName}</span>`,
    `<span style="display:block;font-size:12px;color:#F7F5EE;opacity:.75">Daily Site Report</span>`,
    `</span>`,
    `</div>`,
    `<div style="padding:24px">`,
    `<div style="color:#6B7280;font-size:13px;margin-bottom:16px">${escapeHtml(content.siteName)} · ${escapeHtml(content.reportDate)}</div>`,
    `<table style="width:100%;border-collapse:collapse">`,
    row('Work Completed', escapeHtml(content.work.completed ?? '—')),
    row(
      'Labour Present',
      `${content.labour.present} of ${content.labour.total}`,
    ),
    row('Materials Consumed', materials),
    row('RMC Delivered', rmc),
    row(
      'Expenses Logged',
      `₹${content.expenses.total.toLocaleString('en-IN')}`,
    ),
    row('Site Photos', `${content.photos.count} attached`),
    `</table>`,
    `</div>`,
    `</div>`,
  ].join('');
}

// EMAIL via Resend (architecture spine's decided vendor). Resend's documented
// HTTPS API is called directly via fetch — no SDK dependency is added, so the
// build stays dependency-clean and the network call is easy to mock. Not yet
// exercised against a real Resend account (no RESEND_API_KEY has existed in
// any environment this codebase has run in — the same status as the R2
// storage client). When unconfigured it throws a clear, honest error that
// surfaces in-app as the delivery's lastError (AC #3), never a silent drop.
export class ResendEmailSender implements EmailSender {
  async send(recipients: string[], content: ReportContent): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_EMAIL_FROM;
    if (!apiKey || !from) {
      throw new Error(
        'Email delivery not configured (RESEND_API_KEY / REPORT_EMAIL_FROM missing)',
      );
    }
    const rawResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: `Daily Site Report — ${content.siteName} — ${content.reportDate}`,
        html: renderReportEmailHtml(content),
      }),
    });
    // Force-cast rather than rely on fetch()'s inferred Response: Vercel's
    // own build-time type-check resolves a narrower ambient Response
    // (missing ok/status) than this repo's own tsconfig does — this
    // sidesteps that environment difference without changing runtime
    // behavior (fetch still returns a real Response either way).
    const response = rawResponse as unknown as { ok: boolean; status: number };
    if (!response.ok) {
      throw new Error(`Resend API responded ${response.status}`);
    }
  }
}

// WHATSAPP is genuinely blocked on an unmade business decision: the WhatsApp
// BSP contract (Gupshup vs Interakt vs AiSensy) is an explicitly deferred
// founder/pricing choice, not an engineering one (architecture spine Deferred
// section; PRD Open Question 3). Picking one here would silently lock in that
// BSP's auth/template/webhook contract. Until a real adapter replaces this,
// WHATSAPP is left OUT of the enabled-channels default; if it is somehow
// enabled, delivery fails honestly with an in-app-visible reason instead of
// crashing.
export class NotConfiguredWhatsAppSender implements WhatsAppSender {
  send(): Promise<void> {
    return Promise.reject(
      new Error('WhatsApp BSP not yet selected (PRD Open Question 3)'),
    );
  }
}
