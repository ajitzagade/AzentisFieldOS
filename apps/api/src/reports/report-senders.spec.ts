import { describe, expect, it } from 'vitest';
import { escapeHtml, renderReportEmailHtml } from './report-senders';
import {
  DEFAULT_PRIMARY_COLOR,
  type ReportContent,
} from './report-compiler.service';

// A non-token brand color used purely as a test fixture, to prove the email
// header renders the tenant's stored color verbatim.
// eslint-disable-next-line no-restricted-syntax -- test fixture brand-color value, not a UI style token
const TEST_PRIMARY_COLOR = '#123456';

function makeContent(overrides: Partial<ReportContent> = {}): ReportContent {
  return {
    siteName: 'NH-48',
    reportDate: '2026-08-11',
    branding: {
      tenantName: 'Sandeep Enterprises',
      logoUrl: null,
      primaryColor: DEFAULT_PRIMARY_COLOR,
    },
    work: {
      completed: 'Sub-base compaction',
      inProgress: null,
      planned: null,
      issuesBlockers: null,
      safetyObservations: null,
      notes: null,
    },
    labour: { present: 2, total: 3 },
    materials: [
      { material: 'Cement', size: 'OPC 53', quantity: 40, unit: 'Bags' },
    ],
    rmc: { loads: 1, totalQuantityM3: 6, grades: ['M25'] },
    equipmentUsed: [],
    expenses: { total: 18600 },
    photos: { count: 2 },
    ...overrides,
  };
}

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" class='y'>&`)).toBe(
      '&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;&amp;',
    );
  });
});

describe('renderReportEmailHtml — branding (Patch 1, FR-32)', () => {
  it("uses the tenant's primaryColor for the header background", () => {
    const html = renderReportEmailHtml(
      makeContent({
        branding: {
          tenantName: 'Sandeep Enterprises',
          logoUrl: null,
          primaryColor: TEST_PRIMARY_COLOR,
        },
      }),
    );
    expect(html).toContain(`background:${TEST_PRIMARY_COLOR}`);
  });

  it('renders the tenant logo as an <img> when logoUrl is present', () => {
    const html = renderReportEmailHtml(
      makeContent({
        branding: {
          tenantName: 'Sandeep Enterprises',
          logoUrl: 'https://cdn.example.com/logo.png',
          primaryColor: TEST_PRIMARY_COLOR,
        },
      }),
    );
    expect(html).toContain('<img');
    expect(html).toContain('https://cdn.example.com/logo.png');
  });

  it('falls back to the tenant wordmark when there is no logo', () => {
    const html = renderReportEmailHtml(makeContent());
    expect(html).not.toContain('<img');
    expect(html).toContain('Sandeep Enterprises');
  });
});

describe('renderReportEmailHtml — escaping (Patch 2, injection)', () => {
  it('escapes injected markup in free-text DSR fields', () => {
    const html = renderReportEmailHtml(
      makeContent({
        siteName: 'Site <script>alert(1)</script>',
        work: {
          completed: 'Poured <slab> & cured',
          inProgress: null,
          planned: null,
          issuesBlockers: null,
          safetyObservations: null,
          notes: null,
        },
        branding: {
          tenantName: 'Acme & Co <b>',
          logoUrl: null,
          primaryColor: DEFAULT_PRIMARY_COLOR,
        },
        materials: [
          { material: 'Cement <x>', size: '50kg', quantity: 40, unit: 'Bags' },
        ],
      }),
    );

    // The raw injected markup must never appear unescaped…
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('Poured <slab>');
    // …only its escaped form.
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('Poured &lt;slab&gt; &amp; cured');
    expect(html).toContain('Acme &amp; Co &lt;b&gt;');
    expect(html).toContain('Cement &lt;x&gt;');
  });
});
