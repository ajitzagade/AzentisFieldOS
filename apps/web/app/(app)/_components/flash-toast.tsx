"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!flash) return;
    toast.success(flash);
    const rest = new URLSearchParams(searchParams);
    rest.delete("flash");
    const query = rest.toString();
    // After the replace, `flash` becomes null and the re-run no-ops — so
    // listing every dependency cannot double-announce.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [flash, pathname, router, searchParams, toast]);

  return null;
}
