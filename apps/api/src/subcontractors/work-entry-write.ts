import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { applyQuantityDelta } from './quantity-completed';

// spec-dsr-activity-sync-detail-panel (goal 4): the validation-plus-
// applyQuantityDelta body extracted out of WorkEntriesService.create() so
// dsr.service.ts's materializeSubRecords/correct() can create a real
// SubcontractorWorkEntry inside its OWN already-open transaction, without
// duplicating the Active/non-Fixed-Cost/correction-match validation
// WorkEntriesService.create() already enforces for the standalone path.
// tx-accepting (not Injectable) — both call sites already hold a
// Prisma.TransactionClient by the time they reach here.
export interface WorkEntryWriteInput {
  siteContractId: string;
  // A signed delta when correctsId is set (mirrors createSubcontractorWorkEntrySchema's
  // own convention — see quantity-completed.ts's applyQuantityDelta), the
  // absolute quantity for a fresh entry.
  quantity: number;
  workDate: Date;
  note?: string;
  correctsId?: string;
  reason?: string;
  // spec-dsr-activity-sync-detail-panel: set only when this entry was
  // created from a Daily Report's Subcontractor section — mirrors
  // RmcEntry/WasteDisposal's own dailySiteReportId/clientGeneratedId pair.
  dailySiteReportId?: string;
  clientGeneratedId?: string;
  // Review fix (finding #6): the DSR's own siteId, when this entry was
  // created from a Daily Report — cross-checked against the picked Site
  // Contract's siteId so a DSR can't materialize a Work Entry against a
  // different Site's Contract. Optional and unchecked for the standalone
  // Work Entry surface (WorkEntriesService.create()), which has no
  // separate "expected Site" to validate against — the user is already on
  // that exact Site Contract's own page.
  siteId?: string;
}

export async function createWorkEntry(
  tx: Prisma.TransactionClient,
  input: WorkEntryWriteInput,
  recordedByUserId: string,
) {
  const contract = await tx.siteContract.findUnique({
    where: { id: input.siteContractId },
    include: { subcontractor: true },
  });
  if (!contract || contract.subcontractor.deletedAt) {
    throw new BadRequestException('This Site Contract does not exist');
  }
  // Review fix (finding #6): a DSR-embedded Subcontractor entry must not
  // be able to materialize a Work Entry against a Site Contract belonging
  // to a different Site than the DSR itself.
  if (input.siteId && contract.siteId !== input.siteId) {
    throw new BadRequestException(
      'This Site Contract does not belong to this Site',
    );
  }
  // AC #3: only an Active contract accepts Work Entries — applies to a
  // correction too, since it targets the same (still-current) contract.
  if (contract.status !== 'ACTIVE') {
    throw new BadRequestException({
      error: {
        code: 'CONTRACT_NOT_ACTIVE',
        message:
          'Work Entries can only be recorded against an Active Site Contract',
      },
    });
  }
  // AC #2: Fixed Cost contracts have no billable quantity — completion is
  // tracked via status only (no BOQ/percent-complete concept in this
  // product, see Epic 2's "Activity Pulse" precedent).
  if (contract.rateType === 'FIXED_COST') {
    throw new BadRequestException({
      error: {
        code: 'FIXED_COST_NO_QUANTITY',
        message:
          "Fixed Cost contracts don't track work quantity — update the contract's status directly",
      },
    });
  }

  if (input.correctsId) {
    const original = await tx.subcontractorWorkEntry.findUnique({
      where: { id: input.correctsId },
    });
    if (!original || original.siteContractId !== input.siteContractId) {
      throw new BadRequestException(
        'The Work Entry being corrected does not exist on this Site Contract',
      );
    }
  }

  const entry = await tx.subcontractorWorkEntry.create({
    data: {
      siteContractId: input.siteContractId,
      quantity: input.quantity,
      workDate: input.workDate,
      note: input.note,
      correctsId: input.correctsId,
      reason: input.reason,
      recordedByUserId,
      dailySiteReportId: input.dailySiteReportId,
      clientGeneratedId: input.clientGeneratedId,
    },
  });
  // AD-9: quantityCompleted is materialized and write-path-only, updated
  // in the same transaction as the causing row. Floor-checked so a
  // reducing correction can never drive it below zero (AC #5).
  await applyQuantityDelta(tx, input.siteContractId, input.quantity);
  return entry;
}
