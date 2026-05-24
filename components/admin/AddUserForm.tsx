"use client";

import { useState, useTransition } from "react";
import { createUser } from "@/lib/actions/admin-users";

type EntityOption = { id: string; code: string; name: string };
type ManagerOption = { id: string; name: string | null; email: string };

type Props = {
  entities: EntityOption[];
  managerOptions: ManagerOption[];
};

export function AddUserForm({ entities, managerOptions }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createUser(fd);
      if (!res.ok) setError(res.error);
      else {
        form.reset();
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-sm bg-gold px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-navy transition-colors hover:bg-navy hover:text-gold"
      >
        + Add user
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded border border-line bg-white p-6"
    >
      <h3 className="heading-serif mb-4 text-xl text-navy">Add a user</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            required
            placeholder="user@seven-gen.com"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Name">
          <input
            name="name"
            placeholder="Optional"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Role">
          <select
            name="role"
            defaultValue="EMPLOYEE"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
        <Field label="Entity">
          <select
            name="entityId"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="">(none)</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Manager">
          <select
            name="managerId"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="">(none)</option>
            {managerOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name ?? m.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Initial password (min 8 chars)" required>
          <input
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="Tell the user this — they can change it from /profile"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
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
          {pending ? "Adding…" : "Add user"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-mono">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
