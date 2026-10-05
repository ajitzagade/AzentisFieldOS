import { z } from "zod";

// A Vendor Advance only ever comes into existence as a side effect of a
// HIRED Waste Disposal entry (WasteDisposalService.create) — there is no
// standalone "record an advance" surface. This schema exists solely for
// the correction path (AD-9): a wrongly-entered amount or payment method is
// fixed with a new, reason-carrying row linked via correctsId, never an
// UPDATE/DELETE of the original. `correctsId` is therefore always required,
// unlike the other correctable ledgers which also support a plain create.
export const correctVendorAdvanceSchema = z.object({
  correctsId: z.uuid(),
  amount: z.number().refine((value) => value !== 0, {
    message: "A correction's amount delta must not be zero",
  }),
  paymentMethod: z.string().max(100).optional(),
  reason: z.string().min(1).max(500),
});

export type CorrectVendorAdvanceInput = z.infer<typeof correctVendorAdvanceSchema>;
