"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  DataTable,
  MailIcon,
  SelectField,
  TextField,
  PlusIcon,
  UsersIcon,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { ROLES, inviteUserSchema, type Role } from "@azentisfieldos/shared";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role | null;
  status: "Active" | "Pending";
}

// AC #1 / AD-11: the SelectField is populated ONLY from the shared ROLES
// constant, so a third tier can never be offered. Labels are display-only.
const ROLE_LABELS: Record<Role, string> = {
  OWNER_ADMIN: "Owner/Admin",
  SITE_SUPERVISOR: "Site Supervisor",
};
const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

function RoleBadge({ role }: { role: Role | null }) {
  if (!role) return <span className="text-caption text-ink-500">—</span>;
  return <Badge variant={role === "OWNER_ADMIN" ? "gold" : "neutral"}>{ROLE_LABELS[role]}</Badge>;
}

// Inline role change for an Active user — a shared SelectField (AD-5), never a
// raw <select>. PATCH /users/:id/role, then refresh the server component so the
// merged list re-reads from apps/api.
function RoleCell({
  row,
  onChange,
}: {
  row: UserRow;
  onChange: (id: string, role: Role) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  if (row.status !== "Active" || !row.role) return <RoleBadge role={row.role} />;
  return (
    <SelectField
      label={`Role for ${row.name ?? row.email}`}
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

export function UsersRolesSection({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("SITE_SUPERVISOR");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState<string | null>(null);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setInvited(null);
    setFieldErrors({});

    // AD-7: validate with the SAME shared schema apps/api enforces.
    const parsed = inviteUserSchema.safeParse({ email: email.trim(), role });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setInviting(true);
    try {
      const res = await authedFetch("/users/invite", {
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
      if (!res.ok) {
        setFormError("Could not send that invitation. Please try again.");
        return;
      }
      setInvited(parsed.data.email);
      setEmail("");
      setRole("SITE_SUPERVISOR");
      router.refresh();
    } catch {
      setFormError("Could not send that invitation. Please try again.");
    } finally {
      setInviting(false);
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

  const columns: DataTableColumn<UserRow>[] = [
    { header: "Name", cell: (row) => row.name ?? <span className="text-ink-500">Invited</span> },
    { header: "Email", cell: (row) => <span className="text-ink-500">{row.email}</span> },
    { header: "Role", cell: (row) => <RoleCell row={row} onChange={handleRoleChange} /> },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "Active" ? "success" : "warning"}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleInvite} noValidate className="grid grid-cols-1 gap-x-5 sm:grid-cols-[1.5fr_1fr_auto] sm:items-start">
        <TextField
          label="Invite by email"
          type="email"
          icon={<MailIcon className="size-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setInvited(null);
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
        <Button type="submit" isLoading={inviting} className="sm:mt-6">
          <PlusIcon className="size-4" />
          Invite User
        </Button>
      </form>

      {formError ? (
        <p role="alert" className="text-caption text-danger-700">
          {formError}
        </p>
      ) : null}
      {invited ? (
        <p role="status" className="text-caption text-success-700">
          Invitation sent to {invited}.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          users.length === 0
            ? { status: "empty", message: "No users yet — invite your first teammate above." }
            : { status: "success", rows: users }
        }
      />
    </div>
  );
}
