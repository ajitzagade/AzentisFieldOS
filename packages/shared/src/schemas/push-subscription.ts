import { z } from "zod";

// apps/api later POSTs directly to `endpoint` (web-push's sendNotification)
// on this user's behalf whenever a push fires — an unrestricted client-
// supplied URL would let an authenticated user register an arbitrary
// internal/private address as their "subscription" and get the server to
// make outbound requests to it (SSRF). Real push subscriptions only ever
// come from one of a handful of browser vendors' own push services, so this
// allowlists known hosts rather than trying to characterize every bad one.
const ALLOWED_PUSH_ENDPOINT_HOSTS = [
  "fcm.googleapis.com",
  "android.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
  "notify.windows.com",
];

function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const host = new URL(endpoint).hostname;
    return ALLOWED_PUSH_ENDPOINT_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

// The shape the browser's PushManager.subscribe() promise resolves to
// (PushSubscription.toJSON()) — endpoint is the push service's own
// per-registration URL, keys.p256dh/auth are the encryption keys apps/api
// needs to encrypt a payload that only this browser can decrypt. Defined
// once here, imported by both apps/api (source of truth) and apps/web (AD-7).
export const createPushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url()
    .refine(isAllowedPushEndpoint, "Not a recognized push service endpoint"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type CreatePushSubscriptionInput = z.infer<typeof createPushSubscriptionSchema>;

export const deletePushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
});

export type DeletePushSubscriptionInput = z.infer<typeof deletePushSubscriptionSchema>;
