"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@azentisfieldos/ui";

// Server Actions confirm success by redirecting with ?flash=<message>
// (a redirect unmounts the form, so an inline success state would never
// be seen). This reads the message once, shows it as a success toast, and
// strips the param so a refresh or share of the URL doesn't re-announce.
export function FlashToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const flash = searchParams.get("flash");

  // Base UI's Toast.useToastManager() (which useToast wraps) does not
  // return a referentially stable object on every render, particularly
  // around this page's hydration boundary — that alone would just mean a
  // few redundant effect re-runs, but Base UI's ToastTitle also fires a
  // setState from its own mount-time layout effect, and the two together
  // can cascade into a render storm (reproduced with
  // @base-ui-components/react 1.0.0-rc.0, the latest available release —
  // no upstream fix to pull). Left alone that storm hits React's runaway-
  // update ceiling and crashes the page; this ref makes the effect
  // idempotent per flash value so any number of extra re-invocations before
  // the URL is cleared are no-ops instead of stacking duplicate toasts.
  const announcedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!flash || announcedRef.current === flash) return;
    announcedRef.current = flash;
    // Deferred to a macrotask so the toast's own mount-time layout effect
    // runs on an already-settled tree rather than inside this component's
    // commit — see the comment above for why that pairing is unsafe here.
    timerRef.current = setTimeout(() => {
      toast.success(flash);
      const rest = new URLSearchParams(searchParams);
      rest.delete("flash");
      const query = rest.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 0);
    // Deliberately no cleanup here: React runs an effect's cleanup before
    // every re-invocation, even one the ref guard above turns into a
    // no-op — clearing the timer there would cancel the one legitimate,
    // already-scheduled announcement the moment an unstable `toast`
    // reference (the trigger above) causes this effect to re-run, and the
    // guard would then block ever rescheduling it. The unmount-only effect
    // below is the sole place this timer gets cancelled.
  }, [flash, pathname, router, searchParams, toast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
