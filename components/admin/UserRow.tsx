"use client";

import { useState, useTransition } from "react";
import { Trash2, KeyRound } from "lucide-react";
import { updateUser, deleteUser, setUserPassword } from "@/lib/actions/admin-users";

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
  const [resettingPw, setResettingPw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
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

  function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    startTransition(async () => {
      const res = await setUserPassword(user.id, newPw);
      if (!res.ok) {
        setPwMsg({ kind: "err", text: res.error });
      } else {
        setPwMsg({
          kind: "ok",
          text: `Password set. Tell the user: "${newPw}" — they can change it from /profile.`,
        });
        setNewPw("");
        setResettingPw(false);
      }
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
          {pwMsg ? (
            <p
              className={
                "mt-1 text-xs " +
                (pwMsg.kind === "ok" ? "text-success" : "text-danger")
              }
            >
              {pwMsg.text}
            </p>
          ) : null}
          {resettingPw ? (
            <form
              onSubmit={handleResetPassword}
              className="mt-2 flex items-center gap-2"
            >
              <input
                type="text"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password (min 8 chars)"
                required
                minLength={8}
                autoFocus
                className="flex-1 rounded-sm border border-line bg-white px-3 py-1.5 text-sm font-mono"
              />
              <button
                type="submit"
                disabled={pending || newPw.length < 8}
                className="rounded-sm bg-navy px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cream hover:bg-navy-soft disabled:opacity-50"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => {
                  setResettingPw(false);
                  setNewPw("");
                }}
                className="text-xs text-muted hover:underline"
              >
                Cancel
              </button>
            </form>
          ) : null}
        </div>
        <div className="flex gap-3 font-mono text-[10px] uppercase tracking-widest text-muted sm:w-72">
          <span>{user.role.toLowerCase()}</span>
          <span>{entityName}</span>
          <span className="truncate">↳ {managerName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setResettingPw((s) => !s);
              setPwMsg(null);
            }}
            className="font-mono text-[11px] uppercase tracking-widest text-navy-soft hover:text-navy inline-flex items-center gap-1"
            aria-label="Reset password"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Reset PW
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
