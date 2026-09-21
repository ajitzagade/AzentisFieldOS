import { createDailyLabourerSchema } from "@azentisfieldos/shared";
import { optionalNumber } from "../../../../lib/parse-helpers";

// The single FormData→schema coercion for this form, run by BOTH the Server
// Action (source of truth) and the client's useClientValidation hook (AD-7).
export function parseCreateDailyLabourerForm(formData: FormData) {
  return createDailyLabourerSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    defaultPerDayAmount: optionalNumber(formData.get("defaultPerDayAmount")),
  });
}
