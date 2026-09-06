import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { createWasteDisposalSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

// Feature 2026-09-06: an advance to a HIRED disposal's Vendor — validation
// lives entirely in the shared schema (AD-7), pinned here the same way
// AdvancesController pins createAdvanceSchema's own rules.
describe('ZodValidationPipe(createWasteDisposalSchema) — advance to the hired Vendor', () => {
  const pipe = new ZodValidationPipe(createWasteDisposalSchema);

  const hiredBase = {
    siteId: '11111111-1111-4111-8111-111111111111',
    wasteType: 'Debris',
    ownership: 'HIRED',
    vendorId: '22222222-2222-4222-8222-222222222222',
    tripCount: 4,
    ratePerTrip: 500,
    paymentStatus: 'UNPAID',
    disposedAt: '2026-09-06',
  };

  it('accepts a HIRED disposal with an advance', () => {
    expect(() =>
      pipe.transform({
        ...hiredBase,
        advance: { amount: 2000, paymentMethod: 'Cash' },
      }),
    ).not.toThrow();
  });

  it('accepts a HIRED disposal with no advance at all', () => {
    expect(() => pipe.transform(hiredBase)).not.toThrow();
  });

  it('rejects an advance on an OWN disposal — there is no Vendor to pay', () => {
    expect(() =>
      pipe.transform({
        siteId: hiredBase.siteId,
        wasteType: 'Debris',
        ownership: 'OWN',
        tripCount: 4,
        ratePerTrip: 500,
        disposedAt: '2026-09-06',
        advance: { amount: 2000 },
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a non-positive advance amount', () => {
    expect(() =>
      pipe.transform({ ...hiredBase, advance: { amount: 0 } }),
    ).toThrow(BadRequestException);
  });

  it('rejects an advance on a correction', () => {
    expect(() =>
      pipe.transform({
        ...hiredBase,
        tripCount: -1,
        correctsId: '33333333-3333-4333-8333-333333333333',
        reason: 'Trip double-counted',
        advance: { amount: 2000 },
      }),
    ).toThrow(BadRequestException);
  });
});
