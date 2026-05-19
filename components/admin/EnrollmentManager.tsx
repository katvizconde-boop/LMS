"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  enrollUsers,
  unenrollUser,
  enrollByCriteria,
} from "@/lib/actions/admin-enrollments";

type EnrollmentRow = {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "EMPLOYEE" | "MANAGER" | "ADMIN";
    entity: { code: string } | null;
  };
  enrolledAt: string; // serialized
};

type AvailableUser = {
  id: string;
  name: string | null;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  entity: { code: string } | null;
};

type EntityOption = { id: string; code: string };

type Props = {
  programId: string;
  enrolled: EnrollmentRow[];
  availableUsers: AvailableUser[];
  entities: EntityOption[];
};

export function EnrollmentManager({
  programId,
  enrolled,
  availableUsers,
  entities,
}: Props) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visibleUsers = filter
    ? availableUsers.filter(
        (u) =>
          u.email.toLowerCase().includes(filter.toLowerCase()) ||
          (u.name ?? "").toLowerCase().includes(filter.toLowerCase()),
      )
    : availableUsers;

  function togglePick(id: string) {
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onEnrollSelected() {
    if (picked.size === 0) return;
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await enrollUsers(programId, Array.from(picked));
      if (!res.ok) setError(res.error);
      else {
        setMsg(`Enrolled ${res.added ?? 0} user(s).`);
        setPicked(new Set());
      }
    });
  }

  function onUnenroll(userId: string) {
    if (!confirm("Unenroll this user from the program?")) return;
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await unenrollUser(programId, userId);
      if (!res.ok) setError(res.error);
    });
  }

  function onBulkEnroll(formData: FormData) {
    const entityIds = formData.getAll("entityIds").map(String);
    const roles = formData.getAll("roles").map(String) as Array<
      "EMPLOYEE" | "MANAGER" | "ADMIN"
    >;
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await enrollByCriteria(programId, { entityIds, roles });
      if (!res.ok) setError(res.error);
      else setMsg(`Bulk-enrolled ${res.added ?? 0} new user(s).`);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <div className="label-mono mb-3">Currently enrolled · {enrolled.length}</div>
        {enrolled.length === 0 ? (
          <p className="text-sm text-muted">No one enrolled yet.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {enrolled.map((e) => (
              <li
                key={e.userId}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-navy">
                    {e.user.name ?? e.user.email}
                  </p>
                  <p className="text-xs text-muted">{e.user.email}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {e.user.role.toLowerCase()}
                    {e.user.entity ? ` · ${e.user.entity.code}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnenroll(e.userId)}
                  disabled={pending}
                  className="text-danger hover:opacity-80 disabled:opacity-50"
                  aria-label="Unenroll"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <div className="label-mono mb-3">Enroll individuals</div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or email…"
            className="mb-3 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
          {availableUsers.length === 0 ? (
            <p className="text-sm text-muted">Everyone is already enrolled.</p>
          ) : (
            <>
              <ul className="max-h-72 divide-y divide-line overflow-auto rounded-sm border border-line">
                {visibleUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={picked.has(u.id)}
                      onChange={() => togglePick(u.id)}
                      className="h-4 w-4 accent-gold"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-navy">
                        {u.name ?? u.email}
                      </p>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {u.role.toLowerCase()}
                      {u.entity ? ` · ${u.entity.code}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onEnrollSelected}
                disabled={pending || picked.size === 0}
                className="mt-3 rounded-sm bg-gold px-4 py-2 font-mono text-xs uppercase tracking-widest text-navy hover:bg-navy hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enroll {picked.size} selected
              </button>
            </>
          )}
        </div>

        <details className="rounded border border-dashed border-line bg-cream-deep p-4">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-navy">
            Bulk-enroll by entity + role
          </summary>
          <form
            action={onBulkEnroll}
            className="mt-4 flex flex-col gap-3 text-sm"
          >
            <div>
              <p className="label-mono mb-2">Entities</p>
              <div className="flex flex-wrap gap-3">
                {entities.map((e) => (
                  <label key={e.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="entityIds"
                      value={e.id}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="font-mono text-xs">{e.code}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="label-mono mb-2">Roles</p>
              <div className="flex flex-wrap gap-3">
                {(["EMPLOYEE", "MANAGER", "ADMIN"] as const).map((r) => (
                  <label key={r} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="roles"
                      value={r}
                      defaultChecked={r === "EMPLOYEE"}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="font-mono text-xs">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="self-end rounded-sm bg-navy px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream hover:bg-navy-soft disabled:opacity-50"
            >
              Bulk-enroll
            </button>
          </form>
        </details>

        {msg ? <p className="text-sm text-success">{msg}</p> : null}
        {error ? (
          <p className="rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
