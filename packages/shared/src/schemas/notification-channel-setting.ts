import { z } from "zod";

// Story 14.4 (FR-50): the shared shape for editing one notification channel's
// configuration. Keyed by `channel` in the route (PATCH
// /notification-settings/:channel), not in the body — the body carries only the
// two editable fields. `recipientUserIds` are User.id UUIDs (resolved to emails
// at send time). Defined once here, imported by both apps/api (source of truth)
// and apps/web (AD-7).
export const updateNotificationChannelSettingSchema = z.object({
  enabled: z.boolean(),
  recipientUserIds: z.array(z.uuid()),
});

export type UpdateNotificationChannelSettingInput = z.infer<
  typeof updateNotificationChannelSettingSchema
>;
