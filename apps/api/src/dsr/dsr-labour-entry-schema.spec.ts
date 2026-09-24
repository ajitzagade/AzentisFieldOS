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

  // Revised 2026-09-24 (user-requested): the new row shape gained a
  // Men/Women/Mistri headcount tally alongside labourerId — both optional,
  // a row is complete once at least one of the four is set.
  it('accepts a headcount-only row (no labourerId)', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      men: 3,
      women: 1,
      mistri: 2,
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a row combining a named Labourer AND a headcount', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      labourerId: 'labourer-1',
      men: 5,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success && 'men' in parsed.data) {
      expect(parsed.data.men).toBe(5);
    }
  });

  it('rejects a new-shape row with every field absent or zero', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      men: 0,
      women: 0,
      mistri: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a legacy-shaped row (has `category`) with a stray `mistri` key — the new schema is .strict() so it cannot silently absorb and strip category', () => {
    const parsed = dsrLabourEntrySchema.safeParse({
      category: 'Mason',
      men: 3,
      women: 1,
      mistri: 2,
    });
    // Neither branch matches: the legacy schema is `.strict()` too and has
    // no `mistri` field, so this correctly fails rather than silently
    // matching the new schema and dropping `category`.
    expect(parsed.success).toBe(false);
  });
});
