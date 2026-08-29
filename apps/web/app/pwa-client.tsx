"use client";

import { useEffect } from "react";

// Client-only PWA glue (story 1.9), mounted once in the root layout so it
// also covers /sign-in: registers the hand-authored service worker
// (public/sw.js) — production builds only; a no-op in dev/test to avoid
// caching friction. The install-prompt affordance itself lives in the
// authenticated app shell's sidebar (usePwaInstall + a "Download app"
// action above Sign out), not as an unprompted floating banner here.
export function PwaClient() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure must never break the app; offline is a bonus.
    });
  }, []);

  return null;
}
