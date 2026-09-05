"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthedFetch } from "./use-authed-fetch";

// VAPID public keys arrive base64url-encoded; PushManager.subscribe()'s
// applicationServerKey wants raw bytes.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export interface PushNotifications {
  /** True once push is possible in principle here: SW + PushManager exist,
   * a public VAPID key is configured, and the SW actually registers (only
   * in production builds — see pwa-client.tsx). Does NOT mean permission
   * is granted yet. */
  supported: boolean;
  /** Browser permission state — "unsupported" when `supported` is false. */
  permission: NotificationPermission | "unsupported";
  /** Whether THIS device actually has a live PushManager subscription right
   * now — checked directly via getSubscription(), independent of
   * `permission`. A browser can report "granted" permission (e.g. it was
   * granted once before, or a test/automation context pre-grants it) with
   * no real subscription underneath; the UI must reflect the subscription,
   * not the permission, or it can claim "on" when nothing would ever
   * arrive. Undefined until the initial check resolves. */
  subscribed: boolean | undefined;
  subscribing: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

// Mirrors use-pwa-install.ts's shape (available/isIos/install) for the same
// kind of progressive, permission-gated browser capability. Enable/disable
// is per-device by nature (a subscription is tied to one browser install),
// unlike Settings' NotificationChannelSetting rows, which are tenant-wide
// delivery config — deliberately kept as two separate concerns rather than
// folded into one "Push" channel row.
export function usePushNotifications(): PushNotifications {
  const authedFetch = useAuthedFetch();
  // Starts `false`/"unsupported", matching what the server always renders
  // (it has no `window`/`navigator`) — computed for real below, inside a
  // post-hydration effect, same reasoning as use-pwa-install.ts's isIos
  // detection. Unlike `permission`/`subscribed`, `supported` used to be a
  // plain const recomputed every render — but `typeof window` is already
  // true on the client's very first render, before this effect runs, so it
  // could disagree with the server-rendered HTML and trigger a hydration
  // mismatch. Deferring it into state closes that gap.
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  );
  const [subscribed, setSubscribed] = useState<boolean | undefined>(undefined);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isSupported =
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once post-hydration, see note above
    setSupported(isSupported);
    if (!isSupported) {
      setPermission("unsupported");
      setSubscribed(false);
      return;
    }
    setPermission(Notification.permission);
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(subscription !== null))
      .catch(() => setSubscribed(false));
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported) return;
    setSubscribing(true);
    setError(null);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
        ),
      });
      const json = subscription.toJSON();
      const response = await authedFetch("/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save subscription (${response.status})`);
      }
      setSubscribed(true);
    } catch {
      setError("Couldn't turn on notifications on this device. Please try again.");
    } finally {
      setSubscribing(false);
    }
  }, [authedFetch, supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setSubscribing(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Best-effort: still unsubscribe locally even if the server call
        // fails, so the browser's own permission/subscription state and
        // this hook's view of it never disagree.
        await authedFetch("/push-subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => undefined);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      setError("Couldn't turn off notifications. Please try again.");
    } finally {
      setSubscribing(false);
    }
  }, [authedFetch, supported]);

  return { supported, permission, subscribed, subscribing, error, subscribe, unsubscribe };
}
