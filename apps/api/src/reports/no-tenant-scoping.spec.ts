import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Story 13.2 AC #2 / Task 3: the concrete, automatable version of "every
// report here is Tenant-scoped by construction (AD-1), not by a filter this
// story adds." AD-1 is explicit: "No table, model, query, or API route may
// reference a 'current tenant' selector... A pull request introducing
// tenant-scoping logic is solving a problem this architecture doesn't have."
//
// This asserts that NONE of the files this story adds or extends contains
// tenant-scoping *code*. Comments are stripped first, precisely because this
// story's own files deliberately DISCUSS the absence of a tenant filter in
// prose (report-filters.ts, site-inventory-reports.service.ts) — that prose
// is the point, and must not trip the check.
const here = __dirname;
const apiSrc = resolve(here, '..');
const repoRoot = resolve(here, '../../../..');

const STORY_FILES = [
  resolve(here, 'site-inventory-reports.service.ts'),
  resolve(here, 'reports.controller.ts'),
  resolve(apiSrc, 'common/date-range.ts'),
  resolve(apiSrc, 'dsr/dsr.service.ts'),
  resolve(apiSrc, 'inventory/purchases.service.ts'),
  resolve(apiSrc, 'inventory/movements.service.ts'),
  resolve(apiSrc, 'inventory/consumption.service.ts'),
  resolve(apiSrc, 'inventory/return-wastage.service.ts'),
  resolve(apiSrc, 'inventory/stock.service.ts'),
  resolve(apiSrc, 'sites/site-activity-feed.ts'),
  resolve(apiSrc, 'sites/site-photo-gallery.ts'),
  resolve(repoRoot, 'packages/shared/src/types/report-filters.ts'),
];

// Story 13.3 (AC #2 / Task 3): the same AD-1 guarantee extended to the Labour
// and Machinery/Vehicle report composition layers and every owning-epic
// service method they thread the report filters through. None of these files
// may introduce tenant-scoping code — the report is Tenant-scoped by
// construction, not by a filter this story adds.
const STORY_13_3_FILES = [
  resolve(here, 'labour-reports.service.ts'),
  resolve(here, 'machinery-reports.service.ts'),
  resolve(here, 'reports.controller.ts'),
  resolve(apiSrc, 'team/work-records.service.ts'),
  resolve(apiSrc, 'team/payments.service.ts'),
  resolve(apiSrc, 'team/advances.service.ts'),
  resolve(apiSrc, 'team/advance-adjustments.service.ts'),
  resolve(apiSrc, 'assets/asset-movements.service.ts'),
  resolve(apiSrc, 'assets/asset-service-logs.service.ts'),
  resolve(repoRoot, 'packages/shared/src/types/report-filters.ts'),
];

// Story 13.4 (AC #2 / Task 3): the same AD-1 guarantee extended to the
// Financial report composition layer. Its five cost-category SUMs read every
// money column in the (single-Tenant) database with no tenant filter — the
// per-Contractor rollup is "across every Site", i.e. the whole database, by
// construction, not by a WHERE clause this story adds.
const STORY_13_4_FILES = [
  resolve(here, 'financial-reports.service.ts'),
  resolve(here, 'reports.controller.ts'),
  resolve(repoRoot, 'packages/shared/src/types/report-filters.ts'),
];

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/[^\n]*/g, ''); // line comments
}

describe('Story 13.2 files carry no Tenant-scoping code (AD-1, AC #2)', () => {
  it.each(STORY_FILES)(
    '%s has no tenant-scoping identifier in code',
    (file) => {
      const code = stripComments(readFileSync(file, 'utf8')).toLowerCase();
      // Any casing/spelling of a current-tenant selector: tenantId, tenant_id,
      // currentTenant, tenant-scope, etc. — all collapse to containing "tenant".
      expect(code).not.toContain('tenant');
    },
  );
});

describe('Story 13.3 files carry no Tenant-scoping code (AD-1, AC #2)', () => {
  it.each(STORY_13_3_FILES)(
    '%s has no tenant-scoping identifier in code',
    (file) => {
      const code = stripComments(readFileSync(file, 'utf8')).toLowerCase();
      expect(code).not.toContain('tenant');
    },
  );
});

describe('Story 13.4 files carry no Tenant-scoping code (AD-1, AC #2)', () => {
  it.each(STORY_13_4_FILES)(
    '%s has no tenant-scoping identifier in code',
    (file) => {
      const code = stripComments(readFileSync(file, 'utf8')).toLowerCase();
      expect(code).not.toContain('tenant');
    },
  );
});
