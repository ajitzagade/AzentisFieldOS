import { describe, expect, it } from 'vitest';
import {
  dsrSubcontractorEntrySchema,
  saveDraftSchema,
} from '@azentisfieldos/shared';

// Revised 2026-09-24 (user-requested): workNote and siteContractId became
// required on dsrSubcontractorEntrySchema — every DSR-tagged Subcontractor
// must carry a note and link to a real Site Contract (any status; the
// "+ Create Site Contract" quick-create or an existing contract from the
// picker satisfies this — see sites/[id]/contracts/site-contract-quick-
// create-modal.tsx and dsr.service.ts's syncMissingSiteContracts). Only
// quantity stays optional (Work Entries need an Active contract).
// Validated here in apps/api because packages/shared has no test runner of
// its own (same reasoning as dsr-labour-entry-schema.spec.ts), and apps/api
// is the schema's source-of-truth consumer (createDsrSchema's
// subcontractorEntries array, used by POST /dsr and POST /dsr/:id/correct).
describe('dsrSubcontractorEntrySchema (revised 2026-09-24: workNote + siteContractId required)', () => {
  it('accepts a complete row (workNote + siteContractId, no quantity)', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
      workNote: 'On site today',
      siteContractId: 'contract-1',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a complete row with quantity too', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
      workNote: 'Excavation',
      siteContractId: 'contract-1',
      quantity: 6,
      clientGeneratedId: 'client-1',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a row missing workNote', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
      siteContractId: 'contract-1',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a row with an empty-string workNote', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
      workNote: '',
      siteContractId: 'contract-1',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a row missing siteContractId', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
      workNote: 'On site today',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a row missing both workNote and siteContractId (the pre-2026-09-24 "informational only" shape)', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      subcontractorId: 'sub-1',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a row missing subcontractorId entirely', () => {
    const parsed = dsrSubcontractorEntrySchema.safeParse({
      workNote: 'On site today',
      siteContractId: 'contract-1',
    });
    expect(parsed.success).toBe(false);
  });
});

// A draft is explicitly a partial, still-being-built report — a
// Subcontractor row picked but not yet fully filled in must still be
// saveable (dsrSubcontractorEntryDraftSchema, used only by saveDraftSchema).
describe('saveDraftSchema subcontractorEntries (relaxed — drafts allow an incomplete row)', () => {
  function draftInput(subcontractorEntries: unknown[]) {
    return {
      siteId: 'site-1',
      reportDate: '2026-09-24',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
      subcontractorEntries,
      labourEntries: [],
      wasteDisposalEntries: [],
    };
  }

  it('accepts a Subcontractor picked with neither workNote nor siteContractId yet', () => {
    const parsed = saveDraftSchema.safeParse(
      draftInput([{ subcontractorId: 'sub-1' }]),
    );
    expect(parsed.success).toBe(true);
  });

  it('accepts a Subcontractor picked with only workNote', () => {
    const parsed = saveDraftSchema.safeParse(
      draftInput([{ subcontractorId: 'sub-1', workNote: 'Started today' }]),
    );
    expect(parsed.success).toBe(true);
  });

  it('still requires subcontractorId itself — an unpicked row with only a stray field is invalid', () => {
    const parsed = saveDraftSchema.safeParse(
      draftInput([{ workNote: 'No subcontractor picked' }]),
    );
    expect(parsed.success).toBe(false);
  });

  it('a complete row (matching the strict submit shape) is also valid as a draft', () => {
    const parsed = saveDraftSchema.safeParse(
      draftInput([
        { subcontractorId: 'sub-1', workNote: 'Done', siteContractId: 'contract-1' },
      ]),
    );
    expect(parsed.success).toBe(true);
  });
});
