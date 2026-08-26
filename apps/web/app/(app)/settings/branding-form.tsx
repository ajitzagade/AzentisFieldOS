"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BuildingIcon,
  Button,
  CameraIcon,
  CheckCircleIcon,
  HashIcon,
  PhoneIcon,
  TextField,
  TextareaField,
} from "@azentisfieldos/ui";
import { updateBrandingConfigSchema } from "@azentisfieldos/shared";
import { uploadBrandingLogo } from "../../../lib/logo-upload";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

export interface BrandingConfig {
  id: string;
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  registeredAddress: string | null;
  contactPhone: string | null;
  gstin: string | null;
}

interface SwatchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Primary/Secondary/Accent colour picker — the three swatches the mockup shows.
// A native <input type="color"> is the shared, accessible primitive for a
// colour value (labelled, keyboard-operable); the visible chip IS the input, so
// there is no separate design-token literal in component code.
function SwatchInput({ label, value, onChange, error }: SwatchInputProps) {
  const id = useId();
  return (
    <div className="flex flex-col items-center gap-1">
      <input
        id={id}
        type="color"
        aria-label={`${label} brand colour`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-10 cursor-pointer rounded-md border border-border-hairline bg-surface-1 p-0.5 shadow-1"
      />
      <label htmlFor={id} className="text-eyebrow text-ink-500">
        {label}
      </label>
      {error ? (
        <span role="alert" className="text-eyebrow text-danger-700">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function BrandingForm({ config }: { config: BrandingConfig }) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  const [tenantName, setTenantName] = useState(config.tenantName);
  const [logoUrl, setLogoUrl] = useState<string | null>(config.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor);
  const [accentColor, setAccentColor] = useState(config.accentColor);
  const [registeredAddress, setRegisteredAddress] = useState(config.registeredAddress ?? "");
  const [contactPhone, setContactPhone] = useState(config.contactPhone ?? "");
  const [gstin, setGstin] = useState(config.gstin ?? "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    setLogoUploading(true);
    try {
      const { logoUrl: uploadedUrl } = await uploadBrandingLogo(authedFetch, file);
      setLogoUrl(uploadedUrl);
      setSaved(false);
    } catch {
      setLogoError("Could not upload that logo. Please try again.");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSaved(false);
    setFieldErrors({});

    // AD-7: validate with the SAME shared schema apps/api uses. Every field is
    // resubmitted (full replace), so an intentionally-blanked optional field
    // goes as an explicit null to actually clear it, not be silently dropped.
    const parsed = updateBrandingConfigSchema.safeParse({
      tenantName,
      logoUrl: logoUrl || null,
      primaryColor,
      secondaryColor,
      accentColor,
      registeredAddress: registeredAddress.trim() || null,
      contactPhone: contactPhone.trim() || null,
      gstin: gstin.trim() || null,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setSaving(true);
    try {
      const res = await authedFetch(`/branding-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 400) {
        const body = (await res.json()) as {
          error?: { details?: { fieldErrors?: Record<string, string[]> } };
        };
        setFieldErrors(body.error?.details?.fieldErrors ?? {});
        return;
      }
      if (!res.ok) {
        setFormError("Something went wrong saving your branding. Please try again.");
        return;
      }
      setSaved(true);
      // Re-fetch the server components (the live report preview elsewhere reads
      // the saved row) — AC #1: the change reflects with no publish step.
      router.refresh();
    } catch {
      setFormError("Something went wrong saving your branding. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const previewInitial = (tenantName.trim() || "?").charAt(0).toUpperCase();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Organisation name"
          value={tenantName}
          onChange={(e) => {
            setTenantName(e.target.value);
            setSaved(false);
          }}
          maxLength={200}
          icon={<BuildingIcon className="size-4" />}
          error={fieldErrors.tenantName?.[0]}
        />

        <div className="mb-4">
          <span className="mb-1 block text-caption font-semibold text-ink-700">Logo</span>
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-hairline bg-surface-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- runtime tenant logo, not a build-time asset
                <img src={logoUrl} alt="Current logo" className="size-full object-contain" />
              ) : (
                <CameraIcon className="size-5 text-ink-500" />
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={logoUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrl ? "Replace logo" : "Upload logo"}
              </Button>
              <p className="mt-1 text-eyebrow text-ink-500">
                PNG or SVG, up to 2MB, transparent background recommended.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              className="sr-only"
              aria-label="Upload logo file"
              onChange={handleLogoChange}
            />
          </div>
          {logoError ? (
            <p role="alert" className="mt-1 text-eyebrow text-danger-700">
              {logoError}
            </p>
          ) : null}
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-caption font-semibold text-ink-700">Brand colours</span>
          <div className="flex gap-4">
            <SwatchInput
              label="Primary"
              value={primaryColor}
              onChange={(v) => {
                setPrimaryColor(v);
                setSaved(false);
              }}
              error={fieldErrors.primaryColor?.[0]}
            />
            <SwatchInput
              label="Secondary"
              value={secondaryColor}
              onChange={(v) => {
                setSecondaryColor(v);
                setSaved(false);
              }}
              error={fieldErrors.secondaryColor?.[0]}
            />
            <SwatchInput
              label="Accent"
              value={accentColor}
              onChange={(v) => {
                setAccentColor(v);
                setSaved(false);
              }}
              error={fieldErrors.accentColor?.[0]}
            />
          </div>
        </div>

        <TextareaField
          label="Registered address"
          value={registeredAddress}
          onChange={(e) => {
            setRegisteredAddress(e.target.value);
            setSaved(false);
          }}
          rows={2}
          maxLength={500}
          hint="Optional"
          error={fieldErrors.registeredAddress?.[0]}
        />

        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
          <TextField
            label="Contact phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => {
              setContactPhone(e.target.value);
              setSaved(false);
            }}
            maxLength={50}
            hint="Optional"
            icon={<PhoneIcon className="size-4" />}
            error={fieldErrors.contactPhone?.[0]}
          />
          <TextField
            label="GSTIN"
            value={gstin}
            onChange={(e) => {
              setGstin(e.target.value);
              setSaved(false);
            }}
            maxLength={50}
            hint="Optional"
            icon={<HashIcon className="size-4" />}
            error={fieldErrors.gstin?.[0]}
          />
        </div>

        {formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {formError}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={saving}>
            <CheckCircleIcon className="size-4" />
            Save Branding
          </Button>
          {saved ? (
            <span role="status" className="flex items-center gap-1 text-caption text-success-700">
              <CheckCircleIcon className="size-4" />
              Saved
            </span>
          ) : null}
        </div>
      </form>

      {/* Live "Report Branding Preview" — reflects the form's IN-PROGRESS values
          (not the last-saved row), so the Owner/Admin sees their edit before
          saving. Mirrors the branded report-preview header (13.1). The chosen
          brand colours are applied as data-driven inline styles (runtime tenant
          values, not design-token literals) — the same exception the report
          preview card uses. */}
      <div>
        <div className="mb-2 text-eyebrow uppercase text-ink-500">Report Branding Preview</div>
        <div className="overflow-hidden rounded-md border border-border-hairline bg-surface-1 shadow-1">
          <div
            className="flex items-center gap-2 px-4 py-3 text-white"
            style={{ backgroundColor: secondaryColor }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- runtime tenant logo, not a build-time asset
              <img src={logoUrl} alt="" className="size-6 rounded-sm object-contain" />
            ) : (
              <div
                className="flex size-6 items-center justify-center rounded-sm text-eyebrow font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {previewInitial}
              </div>
            )}
            <div className="text-caption font-bold">{tenantName || "Your Company"}</div>
          </div>
          <div className="px-4 py-4 text-caption text-ink-500">
            Daily Site Report · NH-48 Highway Widening — Package 3
            {gstin.trim() ? (
              <>
                <br />
                GSTIN {gstin.trim()}
              </>
            ) : null}
            {contactPhone.trim() ? <> · {contactPhone.trim()}</> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
