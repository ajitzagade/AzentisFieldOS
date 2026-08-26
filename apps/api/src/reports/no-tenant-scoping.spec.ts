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
