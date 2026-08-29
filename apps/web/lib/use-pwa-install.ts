"use client";

import { useEffect, useState } from "react";

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
  // touchscreen is really an iPad, so still treat it as installable.
  const isMac = /Mac/i.test(window.navigator.platform) || /Macintosh/i.test(ua);
  return isMac && window.navigator.maxTouchPoints > 1;
}

export interface PwaInstall {
  /** True when there's something to offer: Android/Chromium has fired
   * beforeinstallprompt, or this is an iOS device not already installed.
   * A "Download app" affordance should only render when this is true. */
  available: boolean;
  /** True on iOS Safari, where there's no programmatic install prompt —
   * only manual Share → Add to Home Screen instructions can be shown. */
  isIos: boolean;
  /** Fires the native install prompt (Android/Chromium only; a no-op if
   * the captured event is gone or this is iOS). */
  install: () => Promise<void>;
}

// Shared PWA-install detection (Story 1.9), used by AppShell's sidebar
// "Download app" action instead of an unprompted floating banner — the
// browser's install signal is the same either way, only how it's
// surfaced differs.
export function usePwaInstall(): PwaInstall {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      // Stop Chrome's mini-infobar; the sidebar action drives the prompt.
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

  useEffect(() => {
    if (isRunningStandalone() || !isIosDevice()) return;
    // iOS/standalone detection reads UA + matchMedia, which only exist
    // client-side; this must run post-hydration (server renders false) to
    // avoid an SSR mismatch, so a one-time setState here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    setIsIos(true);
  }, []);

  async function install() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      // The event is single-use: clear it whatever the outcome (accepted,
      // dismissed, or a rejected prompt) so a stale event is never reused.
      setInstallEvent(null);
    }
  }

  return { available: Boolean(installEvent) || isIos, isIos, install };
}
