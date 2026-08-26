"use client";

import { useEffect, useState } from "react";
import { Button, DownloadIcon } from "@azentisfieldos/ui";

// Client-only PWA glue (story 1.9), mounted once in the root layout so it also
// covers /sign-in:
//   1. Registers the hand-authored service worker (public/sw.js) — production
//      builds only; a no-op in dev/test to avoid caching friction.
//   2. Android/Chromium: captures `beforeinstallprompt` and offers a shared-UI
//      "Install app" button that fires the saved event's prompt().
//   3. iOS Safari (no beforeinstallprompt): shows a dismissible "Add to Home
//      Screen" hint, suppressed when already installed and never reshown once
//      dismissed.
// It renders no chrome at all when there's nothing to offer (already installed,
// unsupported browser, or dismissed).

const IOS_HINT_DISMISSED_KEY = "azentis:ios-install-hint-dismissed";

// Not in the DOM lib types yet — the Chromium-only install prompt event.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayModeStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  // iOS Safari exposes its own non-standard flag.
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayModeStandalone || iosStandalone;
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  // iPadOS 13+ Safari reports a desktop "Macintosh" UA; a Mac platform with a
  // touchscreen is really an iPad, so still offer the add-to-home-screen hint.
  const isMac = /Mac/i.test(window.navigator.platform) || /Macintosh/i.test(ua);
  return isMac && window.navigator.maxTouchPoints > 1;
}

export function PwaClient() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  // 1. Service worker registration — production only.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure must never break the app; offline is a bonus.
    });
  }, []);

  // 2. Android/Chromium install affordance.
  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      // Stop Chrome's mini-infobar; we drive the prompt from our own button.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // 3. iOS add-to-home-screen hint.
  useEffect(() => {
    if (isRunningStandalone() || !isIosDevice()) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(IOS_HINT_DISMISSED_KEY) === "1";
    } catch {
      // Private mode / storage blocked — just show the hint this session.
    }
    // iOS/standalone detection reads UA + matchMedia, which only exist
    // client-side; this must run post-hydration (server renders null) to avoid
    // an SSR mismatch, so a one-time setState here is intentional, not a
    // cascading-render bug.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    if (!dismissed) setShowIosHint(true);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      // The event is single-use: clear it whatever the outcome (accepted,
      // dismissed, or a rejected prompt) so we neither nag nor leak an
      // unhandled rejection.
      setInstallEvent(null);
    }
  }

  // Android: user waved off the install banner — hide it for this page load.
  function handleDismissInstall() {
    setInstallEvent(null);
  }

  function handleDismissIosHint() {
    try {
      window.localStorage.setItem(IOS_HINT_DISMISSED_KEY, "1");
    } catch {
      // Storage blocked — hiding for the session is the best we can do.
    }
    setShowIosHint(false);
  }

  if (!installEvent && !showIosHint) return null;

  return (
    // pb respects the iOS home-indicator safe area (layout opts into
    // viewportFit: "cover", so a bare bottom-0 banner would sit under it in
    // standalone). aria-live announces the banner when it appears.
    <div
      role="region"
      aria-label="Install app"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-border-hairline bg-surface-1 p-4 shadow-2">
        {installEvent ? (
          <>
            <p className="flex-1 text-sm text-ink-700">Install this app for faster, full-screen access.</p>
            <Button variant="ghost" size="sm" onClick={handleDismissInstall}>
              Dismiss
            </Button>
            <Button variant="primary" size="sm" onClick={handleInstall}>
              <DownloadIcon aria-hidden />
              Install app
            </Button>
          </>
        ) : (
          <>
            <p className="flex-1 text-sm text-ink-700">
              To install, tap Share, then <span className="font-semibold text-ink-900">Add to Home Screen</span>.
            </p>
            <Button variant="ghost" size="sm" onClick={handleDismissIosHint}>
              Dismiss
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
