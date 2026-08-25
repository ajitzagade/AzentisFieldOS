import { z } from "zod";

// Standalone expense recording (Epic 11) — separate from the DSR-embedded
// expenses array (Epic 3's dsrExpenseSchema in daily-site-report.ts),
// which stays as-is. This is for expenses recorded directly against a
// Site outside of a Daily Site Report (diesel, petrol, labour welfare,
// site miscellaneous, ...).
export const createExpenseSchema = z.object({
  siteId: z.uuid(),
  categoryId: z.uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).optional(),
  paymentMethod: z.string().min(1).optional(),
  personOrVendor: z.string().min(1).optional(),
  incurredAt: z.iso.date(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
