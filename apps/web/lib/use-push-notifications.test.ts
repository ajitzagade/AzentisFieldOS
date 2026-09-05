import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authedFetchMock = vi.fn();
vi.mock("./use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mock above so use-push-notifications' own
// `useAuthedFetch()` call resolves to the mock (vi.mock is hoisted by
// Vitest's transform, so this static import already sees it).
import { usePushNotifications } from "./use-push-notifications";

function mockSubscription(overrides: Partial<{ endpoint: string }> = {}) {
  return {
    endpoint: overrides.endpoint ?? "https://push.example/abc",
    toJSON: () => ({
      endpoint: overrides.endpoint ?? "https://push.example/abc",
      keys: { p256dh: "p256dh-key", auth: "auth-key" },
    }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
}

function setUpBrowserPushApis({
  permission,
  getSubscriptionReturns = null,
  subscribeReturns,
}: {
  permission: NotificationPermission;
  getSubscriptionReturns?: ReturnType<typeof mockSubscription> | null;
  subscribeReturns?: ReturnType<typeof mockSubscription>;
}) {
  const subscribe = vi.fn().mockResolvedValue(subscribeReturns ?? mockSubscription());
  const getSubscription = vi.fn().mockResolvedValue(getSubscriptionReturns);
  const registration = { pushManager: { subscribe, getSubscription } };

  Object.defineProperty(window.navigator, "serviceWorker", {
    value: { ready: Promise.resolve(registration) },
    configurable: true,
  });
  (window as unknown as { PushManager: unknown }).PushManager = class {};
  const requestPermission = vi.fn().mockResolvedValue(permission);
  (window as unknown as { Notification: unknown }).Notification = {
    permission,
    requestPermission,
  };

  return { subscribe, getSubscription, requestPermission };
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "QUJD"); // base64url "ABC"
  authedFetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete (window as unknown as { Notification?: unknown }).Notification;
  delete (window as unknown as { PushManager?: unknown }).PushManager;
});

describe("usePushNotifications — unsupported environments", () => {
  it("is unsupported outside a production build (dev/test)", () => {
    vi.stubEnv("NODE_ENV", "test");
    setUpBrowserPushApis({ permission: "default" });

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.supported).toBe(false);
    expect(result.current.permission).toBe("unsupported");
  });

  it("is unsupported when no VAPID public key is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    setUpBrowserPushApis({ permission: "default" });

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.supported).toBe(false);
  });

  it("is unsupported when serviceWorker/PushManager exist but Notification does not", () => {
    setUpBrowserPushApis({ permission: "default" });
    delete (window as unknown as { Notification?: unknown }).Notification;

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.supported).toBe(false);
  });
});

describe("usePushNotifications — subscribed reflects a real subscription, not just permission", () => {
  // The bug this guards against: a browser (or an automated/test context)
  // can report Notification.permission === "granted" with zero actual
  // PushManager subscription underneath — e.g. permission was granted once
  // before and then revoked-and-reset server-side, or a test harness
  // pre-grants permission without ever subscribing. Found via real E2E
  // verification (2026-09-05), not a hypothetical — the UI used to read
  // `permission` directly and would claim "Notifications on" in exactly
  // this state.
  it("reports subscribed=false on mount when permission is granted but no PushManager subscription exists", async () => {
    setUpBrowserPushApis({ permission: "granted", getSubscriptionReturns: null });
    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => expect(result.current.subscribed).toBe(false));
    expect(result.current.permission).toBe("granted");
  });

  it("reports subscribed=true on mount when a real PushManager subscription already exists", async () => {
    setUpBrowserPushApis({ permission: "granted", getSubscriptionReturns: mockSubscription() });
    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => expect(result.current.subscribed).toBe(true));
  });
});

describe("usePushNotifications — subscribe", () => {
  it("requests permission, subscribes via the service worker, and posts the subscription to the backend", async () => {
    const { subscribe, requestPermission } = setUpBrowserPushApis({
      permission: "granted",
      getSubscriptionReturns: null,
    });
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.subscribed).toBe(false));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(authedFetchMock).toHaveBeenCalledWith(
      "/push-subscriptions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          endpoint: "https://push.example/abc",
          keys: { p256dh: "p256dh-key", auth: "auth-key" },
        }),
      }),
    );
    await waitFor(() => expect(result.current.permission).toBe("granted"));
    expect(result.current.subscribed).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("stops after permission is denied — never calls pushManager.subscribe or the backend", async () => {
    const { subscribe } = setUpBrowserPushApis({ permission: "denied" });
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    expect(subscribe).not.toHaveBeenCalled();
    expect(authedFetchMock).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.permission).toBe("denied"));
  });

  it("surfaces a user-facing error if the backend save fails, without throwing", async () => {
    setUpBrowserPushApis({ permission: "granted" });
    authedFetchMock.mockResolvedValue({ ok: false, status: 500 });
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
  });
});

describe("usePushNotifications — unsubscribe", () => {
  it("deletes the subscription on the backend and unsubscribes locally", async () => {
    const subscription = mockSubscription();
    setUpBrowserPushApis({ permission: "granted", getSubscriptionReturns: subscription });
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.subscribed).toBe(true));

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(authedFetchMock).toHaveBeenCalledWith(
      "/push-subscriptions",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ endpoint: "https://push.example/abc" }),
      }),
    );
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(result.current.subscribed).toBe(false);
  });

  it("is a no-op when there is no active subscription on this device", async () => {
    setUpBrowserPushApis({ permission: "granted", getSubscriptionReturns: null });
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(authedFetchMock).not.toHaveBeenCalled();
  });
});
