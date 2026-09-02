"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ComboboxField, MapPinIcon } from "@azentisfieldos/ui";

// The single Site picker for entry forms (simplicity review 2026-09-01):
// searchable (a company with many Sites should type, not scroll a native
// dropdown) and sticky (a Supervisor working one Site all day should not
// re-pick it on every entry — the last choice on this device is the
// default next time). Submits through a hidden input so server-action
// forms keep reading a plain `FormData` field.
const LAST_SITE_STORAGE_KEY = "azentisfieldos:last-site-id";

// The remembered Site is read through useSyncExternalStore: the server
// snapshot is null, so SSR and hydration render the empty picker, and the
// client's first post-hydration render applies the stored value — no
// setState-in-effect, no hydration mismatch. The subscribe is deliberately
// inert: the value is latched at mount, so another tab changing the key can
// never swap this form's Site mid-entry.
function subscribeToStorage() {
  return () => {};
}

// Storage access can throw outright (blocked storage in private/embedded
// webviews — exactly the low-end field devices this feature targets); the
// remembered-Site convenience must degrade to "none", never crash the form.
function readStoredSite() {
  try {
    return window.localStorage.getItem(LAST_SITE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearRememberedSite() {
  try {
    window.localStorage.removeItem(LAST_SITE_STORAGE_KEY);
  } catch {
    // nothing to clear where storage is unavailable
  }
}

export interface SiteOption {
  id: string;
  name: string;
}

export interface SiteFieldProps {
  sites: SiteOption[];
  /** FormData field name; defaults to "siteId". */
  name?: string;
  label?: string;
  /** Explicit initial Site (deep link / correction) — beats the remembered one. */
  initialSiteId?: string;
  /** When false, the device's remembered Site is not applied (e.g. source-Site pickers). */
  remember?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  hintTone?: "default" | "positive" | "warning" | "danger";
  onSiteChange?: (siteId: string) => void;
}

export function SiteField({
  sites,
  name = "siteId",
  label = "Site",
  initialSiteId,
  remember = true,
  required,
  disabled,
  error,
  hint,
  hintTone,
  onSiteChange,
}: SiteFieldProps) {
  // null = untouched; the remembered default only applies until the user
  // makes an explicit choice (including clearing the field).
  const [chosen, setChosen] = useState<string | null>(initialSiteId ?? null);
  const storedSite = useSyncExternalStore(subscribeToStorage, readStoredSite, () => null);

  const remembered =
    remember && !initialSiteId && chosen === null && storedSite && sites.some((site) => site.id === storedSite)
      ? storedSite
      : null;
  // A deep-linked/prefilled Site is trusted only once the options can vouch
  // for it: while `sites` is still loading (empty) the candidate is kept, but
  // against a LOADED list that doesn't contain it, a stale link must not
  // leave the picker looking empty while the hidden input silently submits
  // an invalid id.
  const candidate = chosen ?? remembered ?? "";
  const known = candidate !== "" && sites.some((site) => site.id === candidate);
  const siteId = candidate === "" ? "" : known ? candidate : sites.length > 0 ? "" : candidate;

  // Tell the parent when the remembered default kicks in (their dependent
  // state — stock hints, crew defaults — must see it like a user pick).
  // Ref-routed so an inline callback prop doesn't retrigger the effect.
  const onSiteChangeRef = useRef(onSiteChange);
  useEffect(() => {
    onSiteChangeRef.current = onSiteChange;
  });
  useEffect(() => {
    if (remembered) onSiteChangeRef.current?.(remembered);
  }, [remembered]);

  function handleChange(value: string | null) {
    const next = value ?? "";
    setChosen(next);
    if (remember && next) {
      try {
        window.localStorage.setItem(LAST_SITE_STORAGE_KEY, next);
      } catch {
        // remembering is a convenience — never let blocked storage break the pick
      }
    }
    onSiteChange?.(next);
  }

  return (
    <>
      <ComboboxField
        label={label}
        required={required}
        disabled={disabled}
        icon={<MapPinIcon className="size-4" />}
        options={sites.map((site) => ({ value: site.id, label: site.name }))}
        value={siteId || null}
        onValueChange={handleChange}
        placeholder="Type a Site name…"
        emptyMessage="No matching Site"
        hint={hint ?? (remembered ? "Remembered from your last entry" : undefined)}
        hintTone={hint ? hintTone : undefined}
        error={error}
      />
      <input type="hidden" name={name} value={siteId} />
    </>
  );
}
