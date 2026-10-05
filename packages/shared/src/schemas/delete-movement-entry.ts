import { z } from "zod";

// AD-9 exception (approved 2026-10-05): a soft-delete for Purchase/
// Movement/Consumption/WasteDisposal/RmcEntry — the one sanctioned way a
// transaction-history row can disappear from every list/aggregate without
// literally destroying it (the row and its stock-reversal stay in the
// database). Shared by all five DELETE endpoints — one schema, same
// reason-required discipline a correction already carries.
export const deleteMovementEntrySchema = z.object({
  reason: z.string().min(1).max(500),
});

export type DeleteMovementEntryInput = z.infer<typeof deleteMovementEntrySchema>;
