"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { updateUser, deleteUser } from "@/lib/actions/admin-users";

type EntityOption = { id: string; code: string; name: string };
type ManagerOption = { id: string; name: string | null; email: string };

type Props = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "EMPLOYEE" | "MANAGER" | "ADMIN";
    entityId: string | null;
    managerId: string | null;
  };
  entities: EntityOption[];
  managerOptions: ManagerOption[];
  isSelf: boolean;
};

export function UserRow({ user, entities, managerOptions, isSelf }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const entityName = user.entityId
    ? entities.find((e) => e.id === user.entityId)?.code ?? "—"
    : "—";
  const managerName = user.managerId
    ? managerOptions.find((m) => m.id === user.managerId)?.name ??
      managerOptions.find((m) => m.id === user.managerId)?.email ??
      "—"
    : "—";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateUser(user.id, formData);
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if (!res.ok) setError(res.error);
    });
  }

  if (!editing) {
    return (
      <li className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="heading-serif text-xl text-navy">
            {user.name ?? user.email}
          </p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest text-muted sm:w-72">
          <span>{user.role.toLowerCase()}</span>
          <span>{entityName}</span>
          <span className="truncate">↳ {managerName}</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
          >
            Edit
          </button>
          {!isSelf ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="text-danger hover:opacity-80 disabled:opacity-50"
              aria-label="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="py-5">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <FieldLabel label="Name">
          <input
            name="name"
            defaultValue={user.name ?? ""}
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </FieldLabel>
        <FieldLabel label="Email">
          <input
            value={user.email}
            disabled
            className="rounded-sm border border-line bg-cream-deep px-3 py-2 text-sm text-muted"
          />
        </FieldLabel>
        <FieldLabel label="Role">
          <select
            name="role"
            defaultValue={user.role}
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Entity">
          <select
            name="entityId"
            defaultValue={user.entityId ?? ""}
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="">(none)</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.name}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Manager">
          <select
            name="managerId"
            defaultValue={user.managerId ?? ""}
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="">(none)</option>
            {managerOptions
              .filter((m) => m.id !== user.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name ?? m.email}
                </option>
              ))}
          </select>
        </FieldLabel>
        <div className="flex items-end justify-end gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="text-sm text-muted hover:underline"
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-navy px-5 py-2 text-sm font-semibold uppercase tracking-wider text-cream hover:bg-navy-soft disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
        {error ? (
          <p className="rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger sm:col-span-2">
            {error}
          </p>
        ) : null}
      </form>
    </li>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}
