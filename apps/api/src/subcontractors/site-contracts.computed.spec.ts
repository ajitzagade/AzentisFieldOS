import { describe, expect, it } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { computeSiteContractAmounts } from './site-contracts.computed';

describe('computeSiteContractAmounts', () => {
  it('Fixed Cost: amountPayable is the fixed amount, regardless of quantityCompleted', () => {
    const result = computeSiteContractAmounts({
      rateType: 'FIXED_COST',
      rate: null,
      fixedAmount: new Prisma.Decimal(200000),
      quantityCompleted: new Prisma.Decimal(0),
      amountPaid: new Prisma.Decimal(80000),
    });

    expect(result).toEqual({
      amountPayable: 200000,
      outstandingAmount: 120000,
    });
  });

  it('Fixed Cost with no fixedAmount yet (Draft, pending terms): both figures are null, never ₹0', () => {
    const result = computeSiteContractAmounts({
      rateType: 'FIXED_COST',
      rate: null,
      fixedAmount: null,
      quantityCompleted: new Prisma.Decimal(0),
      amountPaid: new Prisma.Decimal(0),
    });

    expect(result).toEqual({ amountPayable: null, outstandingAmount: null });
  });

  it('Per Pipe: amountPayable is rate × quantityCompleted', () => {
    const result = computeSiteContractAmounts({
      rateType: 'PER_PIPE',
      rate: new Prisma.Decimal(250),
      fixedAmount: null,
      quantityCompleted: new Prisma.Decimal(570),
      amountPaid: new Prisma.Decimal(80000),
    });

    expect(result).toEqual({ amountPayable: 142500, outstandingAmount: 62500 });
  });

  it('Per Pipe with no rate yet (Draft, pending terms): both figures are null', () => {
    const result = computeSiteContractAmounts({
      rateType: 'PER_PIPE',
      rate: null,
      fixedAmount: null,
      quantityCompleted: new Prisma.Decimal(0),
      amountPaid: new Prisma.Decimal(0),
    });

    expect(result).toEqual({ amountPayable: null, outstandingAmount: null });
  });

  it('outstandingAmount is negative when paid exceeds payable (an advance ahead of work, FR-59)', () => {
    const result = computeSiteContractAmounts({
      rateType: 'PER_TRIP',
      rate: new Prisma.Decimal(1500),
      fixedAmount: null,
      quantityCompleted: new Prisma.Decimal(10),
      amountPaid: new Prisma.Decimal(50000),
    });

    expect(result).toEqual({ amountPayable: 15000, outstandingAmount: -35000 });
  });

  it('a Draft contract with no rateType at all yields both figures null', () => {
    const result = computeSiteContractAmounts({
      rateType: null,
      rate: null,
      fixedAmount: null,
      quantityCompleted: new Prisma.Decimal(0),
      amountPaid: new Prisma.Decimal(0),
    });

    expect(result).toEqual({ amountPayable: null, outstandingAmount: null });
  });
});
