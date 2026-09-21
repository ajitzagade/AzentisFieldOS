import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { decrementDailyLabourerBalanceWithFloorCheck } from './daily-labour-outstanding-balance';

// tx-accepting (not Injectable) — extracted so DailyLabourAttendanceService
// can create a DailyLabourAdvance inside its OWN already-open transaction
// (the daily-entry form's "Advance" checkbox, per the ask) without
// duplicating the correction/balance-increment logic
// DailyLabourAdvancesService.create() also needs for a standalone advance —
// same reasoning as subcontractors/work-entry-write.ts's createWorkEntry.
export interface DailyLabourAdvanceWriteInput {
  labourerId: string;
  amount: number;
  description?: string;
  givenAt: Date;
  correctsId?: string;
  correctionReason?: string;
}

export async function createDailyLabourAdvance(
  tx: Prisma.TransactionClient,
  input: DailyLabourAdvanceWriteInput,
) {
  if (input.correctsId) {
    const original = await tx.dailyLabourAdvance.findUnique({
      where: { id: input.correctsId },
    });
    if (!original) {
      throw new BadRequestException(
        `Advance ${input.correctsId} does not exist`,
      );
    }
    if (original.labourerId !== input.labourerId) {
      throw new BadRequestException(
        "A correction's Labourer must match the Advance it corrects",
      );
    }
  }

  const advance = await tx.dailyLabourAdvance.create({ data: input });

  // AD-9: outstandingAdvanceBalance is materialized and write-path-only.
  // Advance's sign convention is inverted from AdvanceAdjustment's
  // (positive increases the balance) — same as Team's Advance, see
  // team/advances.service.ts's own comment for why `-amount` is passed.
  await decrementDailyLabourerBalanceWithFloorCheck(
    tx,
    input.labourerId,
    -input.amount,
    "This correction would take the Labourer's Outstanding Balance below zero.",
  );

  return advance;
}
