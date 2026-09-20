"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ConfirmDialog,
  ConfirmDialogRow,
  DataTable,
  LockIcon,
  MailIcon,
  SelectField,
  TextField,
  PlusIcon,
  UsersIcon,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import {
  ROLES,
  createUserSchema,
  resetUserPasswordSchema,
  type Role,
} from "@azentisfieldos/shared";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

// AC #1 / AD-11: the SelectField is populated ONLY from the shared ROLES
// constant, so a third tier can never be offered. Labels are display-only.
const ROLE_LABELS: Record<Role, string> = {
  OWNER_ADMIN: "Owner/Admin",
  SITE_SUPERVISOR: "Site Engineer",
};
const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

// Inline role change — a shared SelectField (AD-5), never a raw <select>.
// PATCH /users/:id/role, then refresh the server component so the list
// re-reads from apps/api.
function RoleCell({
  row,
  onChange,
}: {
  row: UserRow;
  onChange: (id: string, role: Role) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  return (
    <SelectField
      label={`Role for ${row.name}`}
      options={ROLE_OPTIONS}
      value={row.role}
      disabled={pending}
      className="mb-0"
      onChange={async (event) => {
        const next = event.target.value as Role;
        if (next === row.role) return;
        setPending(true);
        try {
          await onChange(row.id, next);
        } finally {
          setPending(false);
        }
      }}
    />
  );
}

export function UsersRolesSection({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SITE_SUPERVISOR");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  // Per-row admin actions (FR-48): reset password and deactivate/reactivate.
  // One dialog instance each, targeted at the row whose action was clicked.
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);
  const [activeTarget, setActiveTarget] = useState<UserRow | null>(null);
  const [activePending, setActivePending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setCreated(null);
    setFieldErrors({});

    // AD-7: validate with the SAME shared schema apps/api enforces.
    const parsed = createUserSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      role,
      password,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setCreating(true);
    try {
      const res = await authedFetch("/users", {
        method: "POST",
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
      if (res.status === 409) {
        setFormError("A user with that email already exists.");
        return;
      }
      if (!res.ok) {
        setFormError("Could not create that user. Please try again.");
        return;
      }
      setCreated(parsed.data.email);
      setName("");
      setEmail("");
      setPassword("");
      setRole("SITE_SUPERVISOR");
      router.refresh();
    } catch {
      setFormError("Could not create that user. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(id: string, nextRole: Role) {
    const res = await authedFetch(`/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (res.ok) router.refresh();
  }

  function openReset(row: UserRow) {
    setActionNotice(null);
    setActionError(null);
    setResetError(null);
    setNewPassword("");
    setResetTarget(row);
  }

  async function handleResetConfirm() {
    if (!resetTarget) return;
    // AD-7: the SAME shared schema apps/api enforces on this body.
    const parsed = resetUserPasswordSchema.safeParse({ password: newPassword });
    if (!parsed.success) {
      setResetError(
        parsed.error.flatten().fieldErrors.password?.[0] ??
          "Enter a valid password.",
      );
      return;
    }
    setResetPending(true);
    try {
      const res = await authedFetch(`/users/${resetTarget.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        setResetError("Could not reset the password. Please try again.");
        return;
      }
      setActionNotice(
        `Password for ${resetTarget.email} has been reset — hand them the new password yourself.`,
      );
      setResetTarget(null);
    } catch {
      setResetError("Could not reset the password. Please try again.");
    } finally {
      setResetPending(false);
    }
  }

  function openActiveToggle(row: UserRow) {
    setActionNotice(null);
    setActionError(null);
    setActiveTarget(row);
  }

  async function handleActiveConfirm() {
    if (!activeTarget) return;
    setActivePending(true);
    try {
      const res = await authedFetch(`/users/${activeTarget.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !activeTarget.isActive }),
      });
      if (!res.ok) {
        setActionError(
          activeTarget.isActive
            ? "Could not deactivate that account. Please try again."
            : "Could not reactivate that account. Please try again.",
        );
        setActiveTarget(null);
        return;
      }
      setActionNotice(
        activeTarget.isActive
          ? `${activeTarget.name} can no longer sign in. Their records and history are kept.`
          : `${activeTarget.name} can sign in again.`,
      );
      setActiveTarget(null);
      router.refresh();
    } catch {
      setActionError("Something went wrong. Please try again.");
      setActiveTarget(null);
    } finally {
      setActivePending(false);
    }
  }

  // The row's action buttons — shared between the desktop Actions column and
  // the mobile card footer. Deactivation is never offered on your own row
  // (the API refuses it too; this just keeps the dead end out of the UI).
  function actionButtons(row: UserRow) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => openReset(row)}
        >
          <LockIcon className="size-3.5" />
          Reset password
        </Button>
        {row.id === currentUserId ? null : row.isActive ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => openActiveToggle(row)}
          >
            Deactivate
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => openActiveToggle(row)}
          >
            Reactivate
          </Button>
        )}
      </div>
    );
  }

  const columns: DataTableColumn<UserRow>[] = [
    { header: "Name", cell: (row) => row.name },
    { header: "Email", cell: (row) => <span className="text-ink-500">{row.email}</span> },
    { header: "Role", cell: (row) => <RoleCell row={row} onChange={handleRoleChange} /> },
    {
      header: "Status",
      cell: (row) =>
        row.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="neutral">Deactivated</Badge>
        ),
    },
    { header: "Actions", cell: (row) => actionButtons(row) },
  ];

  const mobileCard: DataTableMobileCard<UserRow> = {
    primary: (row) => row.name,
    omitHeaders: ["Name", "Role", "Actions"],
    footer: (row) => (
      <div className="flex flex-col gap-2">
        <RoleCell row={row} onChange={handleRoleChange} />
        {actionButtons(row)}
      </div>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        noValidate
        className="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr_1fr_auto] sm:items-start"
      >
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          placeholder="Full name"
          error={fieldErrors.name?.[0]}
        />
        <TextField
          label="Email"
          type="email"
          icon={<MailIcon className="size-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setCreated(null);
          }}
          maxLength={200}
          placeholder="name@company.com"
          error={fieldErrors.email?.[0]}
        />
        <SelectField
          label="Role"
          icon={<UsersIcon className="size-4" />}
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          error={fieldErrors.role?.[0]}
        />
        <TextField
          label="Password"
          type="password"
          icon={<LockIcon className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={200}
          placeholder="At least 8 characters"
          error={fieldErrors.password?.[0]}
        />
        <Button type="submit" isLoading={creating} className="sm:mt-6">
          <PlusIcon className="size-4" />
          Create User
        </Button>
      </form>
      <p className="text-caption text-ink-500">
        Hand this password to the new user yourself — there is no invitation email.
      </p>

      {formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {formError}
        </p>
      ) : null}
      {created ? (
        <p role="status" className="text-caption text-success-700">
          Created an account for {created}.
        </p>
      ) : null}
      {actionError ? (
        <p role="alert" className="text-caption text-danger-700">
          {actionError}
        </p>
      ) : null}
      {actionNotice ? (
        <p role="status" className="text-caption text-success-700">
          {actionNotice}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(row) => row.id}
        state={
          users.length === 0
            ? { status: "empty", message: "No users yet — create your first teammate above." }
            : { status: "success", rows: users }
        }
      />

      <ConfirmDialog
        open={resetTarget !== null}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
        title="Reset password"
        description={
          resetTarget
            ? resetTarget.id === currentUserId
              ? "This is your own account — after the reset you'll be signed out shortly and must sign in again with the new password."
              : `Set a new password for ${resetTarget.name}. Their current password stops working immediately, and any signed-in session ends within the hour.`
            : undefined
        }
        confirmLabel="Set new password"
        cancelLabel="Cancel"
        confirmLoading={resetPending}
        onConfirm={handleResetConfirm}
      >
        <TextField
          label="New password"
          type="password"
          icon={<LockIcon className="size-4" />}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setResetError(null);
          }}
          maxLength={200}
          placeholder="At least 8 characters"
          error={resetError ?? undefined}
          className="mb-0"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={activeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setActiveTarget(null);
        }}
        title={activeTarget?.isActive ? "Deactivate account" : "Reactivate account"}
        description={
          activeTarget?.isActive
            ? "They can no longer sign in. Nothing they recorded is deleted — every report and entry keeps their name on it, and you can reactivate them any time."
            : "They will be able to sign in again with their existing password."
        }
        confirmLabel={activeTarget?.isActive ? "Deactivate" : "Reactivate"}
        cancelLabel="Cancel"
        confirmLoading={activePending}
        onConfirm={handleActiveConfirm}
      >
        {activeTarget ? (
          <>
            <ConfirmDialogRow label="Name" value={activeTarget.name} />
            <ConfirmDialogRow label="Email" value={activeTarget.email} />
            <ConfirmDialogRow label="Role" value={ROLE_LABELS[activeTarget.role]} />
          </>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
