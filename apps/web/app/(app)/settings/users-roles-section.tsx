"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  DataTable,
  LockIcon,
  MailIcon,
  SelectField,
  TextField,
  PlusIcon,
  UsersIcon,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import { ROLES, createUserSchema, type Role } from "@azentisfieldos/shared";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// AC #1 / AD-11: the SelectField is populated ONLY from the shared ROLES
// constant, so a third tier can never be offered. Labels are display-only.
const ROLE_LABELS: Record<Role, string> = {
  OWNER_ADMIN: "Owner/Admin",
  SITE_SUPERVISOR: "Site Supervisor",
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

export function UsersRolesSection({ users }: { users: UserRow[] }) {
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

  const columns: DataTableColumn<UserRow>[] = [
    { header: "Name", cell: (row) => row.name },
    { header: "Email", cell: (row) => <span className="text-ink-500">{row.email}</span> },
    { header: "Role", cell: (row) => <RoleCell row={row} onChange={handleRoleChange} /> },
  ];

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

      <DataTable
        columns={columns}
        rowKey={(row) => row.id}
        state={
          users.length === 0
            ? { status: "empty", message: "No users yet — create your first teammate above." }
            : { status: "success", rows: users }
        }
      />
    </div>
  );
}
