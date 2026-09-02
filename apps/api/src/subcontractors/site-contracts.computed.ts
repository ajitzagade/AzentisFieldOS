import type { SiteContract } from '../generated/prisma/client';

export interface SiteContractComputed {
  amountPayable: number | null;
  outstandingAmount: number | null;
}

// FR-60: quantity/work completed vs. pending, amount payable, amount paid,
// and outstanding amount are always DERIVED from Work Entry/Payment
// history — never a manually-editable field. This function computes the
// two money figures from a SiteContract row's already-materialized fields
// (quantityCompleted, amountPaid) and its static rate config — no
// additional queries needed, since those two figures are themselves kept
// up to date write-path-only by Stories 18.3/18.4.
//
// `amountPayable` is null (never ₹0) when the rate-type-appropriate
// field itself hasn't been filled in yet (a Draft contract with terms
// still pending) — same "pending, not zero" convention as D7's Purchase
// pricing. `outstandingAmount` may be negative (FR-59 allows a Payment/
// Advance to exceed what's currently payable) — Story 18.5's UI renders
// that as an explicit "advance recovers against future work" state, never
// a raw negative figure with no explanation.
export function computeSiteContractAmounts(
  contract: Pick<
    SiteContract,
    'rateType' | 'rate' | 'fixedAmount' | 'quantityCompleted' | 'amountPaid'
  >,
): SiteContractComputed {
  let amountPayable: number | null;
  if (contract.rateType === 'FIXED_COST') {
    amountPayable =
      contract.fixedAmount === null ? null : contract.fixedAmount.toNumber();
  } else if (contract.rate === null) {
    amountPayable = null;
  } else {
    amountPayable =
      contract.rate.toNumber() * contract.quantityCompleted.toNumber();
  }

  const outstandingAmount =
    amountPayable === null
      ? null
      : amountPayable - contract.amountPaid.toNumber();

  return { amountPayable, outstandingAmount };
}
