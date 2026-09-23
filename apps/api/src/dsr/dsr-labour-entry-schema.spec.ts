import { describe, expect, it } from 'vitest';
import { dsrLabourEntrySchema } from '@azentisfieldos/shared';

// spec-dsr-labour-dropdown: the shared dsrLabourEntrySchema (AD-7) is a
// union of the new {labourerId} shape and the legacy {category, men, women}
// shape — validated here in apps/api because packages/shared has no test
// runner of its own (same reasoning as branding-config.schema.spec.ts),
// and apps/api is the schema's source-of-truth consumer (createDsrSchema's
// labourEntries array, used by POST /dsr, POST /dsr/:id/correct, and
// POST /dsr/draft).
describe('dsrLabourEntrySchema (spec-dsr-labour-dropdown)', () => {
  it('accepts the new labourerId-backed shape', () => {
    const parsed = dsrLabourEntrySchema.safeParse({ labourerId: 'labourer-1' });
    expect(parsed.success).toBe(true);
  });

  it('accepts the new shape with an optional clientGeneratedId', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      labourerId: 'labourer-1',
      clientGeneratedId: 'client-1',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a historical legacy {category, men, women} row unchanged', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      category: 'Mason',
      men: 3,
      women: 1,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a legacy row with nobody in it (defense-in-depth, both zero)', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      category: 'Mason',
      men: 0,
      women: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an empty object — neither shape matches', () => {
    expect(dsrLabourEntrySchema.safeParse({}).success).toBe(false);
  });

  it('rejects a row that matches neither shape (clientGeneratedId with no labourerId or category)', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      clientGeneratedId: 'client-1',
    });
    expect(parsed.success).toBe(false);
  });

  it('has no headcount/quantity field on the new shape — extra keys are stripped, not rejected', () => {
    // "Never" boundary: no headcount field on the new row shape (one row =
    // one named person). A stray `men` alongside a real labourerId still
    // validates as the new shape (z.object strips unrecognized keys) —
    // this documents that it is silently dropped, not accumulated anywhere.
    const parsed = dsrLabourEntrySchema.safeParse({
      labourerId: 'labourer-1',
      men: 5,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('men');
    }
  });
});
