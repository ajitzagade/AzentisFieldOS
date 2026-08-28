"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@azentisfieldos/ui";
import { updateNotificationChannelSettingSchema } from "@azentisfieldos/shared";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

export interface ChannelSetting {
  channel: string;
  enabled: boolean;
  recipientUserIds: string[];
}

export interface RecipientUser {
  id: string;
  name: string | null;
  email: string;
  status: "Active" | "Pending";
}

const CHANNEL_META: Record<
  string,
  { label: string; description: string; supportsRecipients: boolean; unavailable?: boolean }
> = {
  EMAIL: {
    label: "Email",
    description: "The delivered email is the primary branded report recipients see.",
    supportsRecipients: true,
  },
  WHATSAPP: {
    label: "WhatsApp",
    description: "Send the daily report to recipients over WhatsApp.",
    supportsRecipients: true,
    unavailable: true,
  },
  IN_APP: {
    label: "In-App",
    description: "Every Owner/Admin can already see delivered reports in the product — no per-person targeting.",
    supportsRecipients: false,
  },
};

// Story 14.4 (FR-50): one row per channel. Enabling reveals a recipient picker
// (multi-select over existing Users, Story 14.2's GET /users). WhatsApp shows
// the same "not yet available" framing Story 13.1 established — toggling it on
// is real configuration, but the BSP adapter is still a placeholder, so
// nothing is actually delivered yet.
function ChannelRow({
  setting,
  recipients,
}: {
  setting: ChannelSetting;
  recipients: RecipientUser[];
}) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const meta = CHANNEL_META[setting.channel] ?? {
    label: setting.channel,
    description: "",
    supportsRecipients: true,
  };

  const [enabled, setEnabled] = useState(setting.enabled);
  const [selected, setSelected] = useState<string[]>(setting.recipientUserIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRecipient(id: string) {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    const payload = {
      enabled,
      recipientUserIds: meta.supportsRecipients ? selected : [],
    };
    // AD-7: validate with the same shared schema apps/api enforces.
    const parsed = updateNotificationChannelSettingSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Please pick valid recipients and try again.");
      return;
    }

    setSaving(true);
    try {
      const res = await authedFetch(`/notification-settings/${setting.channel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        setError("Could not save this channel. Please try again.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save this channel. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-hairline bg-surface-1 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-card-title text-ink-900">{meta.label}</span>
          {meta.unavailable ? <Badge variant="warning">Not yet available</Badge> : null}
          <Badge variant={enabled ? "success" : "neutral"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <Button
          type="button"
          variant={enabled ? "ghost" : "secondary"}
          size="sm"
          onClick={() => {
            setSaved(false);
            setEnabled((prev) => !prev);
          }}
        >
          {enabled ? "Disable" : "Enable"}
        </Button>
      </div>

      <p className="text-body-sm text-ink-500">{meta.description}</p>

      {meta.unavailable && enabled ? (
        <p className="text-caption text-ink-500">
          WhatsApp delivery is pending a provider decision — reports will not arrive over WhatsApp
          until it is configured. Enabling it here is saved as your intended configuration.
        </p>
      ) : null}

      {enabled && meta.supportsRecipients ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-caption font-semibold text-ink-700">
            Recipients
          </legend>
          {recipients.length === 0 ? (
            <p className="text-caption text-ink-500">
              No active users to choose from yet — invite a teammate above.
            </p>
          ) : (
            recipients.map((user) => (
              <label key={user.id} className="flex items-start gap-2 text-body-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={selected.includes(user.id)}
                  onChange={() => toggleRecipient(user.id)}
                  className="mt-0.5 size-4 shrink-0 rounded border-border-hairline"
                />
                <span className="min-w-0 break-words">
                  {user.name ?? user.email}{" "}
                  <span className="break-all text-ink-500">({user.email})</span>
                </span>
              </label>
            ))
          )}
        </fieldset>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="button" size="sm" isLoading={saving} onClick={handleSave}>
          Save
        </Button>
        {saved ? (
          <span role="status" className="text-caption text-success-700">
            Saved.
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-caption text-danger-700">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function NotificationChannelsSection({
  settings,
  users,
}: {
  settings: ChannelSetting[];
  users: RecipientUser[];
}) {
  // Only Active users (real local User rows) can be report recipients — a
  // pending invite has no persisted User.id to target yet.
  const recipients = users.filter((user) => user.status === "Active");

  return (
    <div className="flex flex-col gap-4">
      {settings.map((setting) => (
        <ChannelRow key={setting.channel} setting={setting} recipients={recipients} />
      ))}
    </div>
  );
}
