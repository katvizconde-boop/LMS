"use client";

import { useState, useTransition } from "react";
import { changeOwnPassword, updateOwnName } from "@/lib/actions/profile";

export function NameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateOwnName(name);
      setMsg(
        res.ok
          ? { kind: "ok", text: "Saved." }
          : { kind: "err", text: res.error },
      );
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <span className="label-mono">Display name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          className="rounded-sm border border-line bg-white px-4 py-2.5 text-base"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        {msg ? (
          <p
            className={
              "text-sm " + (msg.kind === "ok" ? "text-success" : "text-danger")
            }
          >
            {msg.text}
          </p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save name"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ kind: "err", text: "New password and confirmation don't match." });
      return;
    }
    startTransition(async () => {
      const res = await changeOwnPassword(current, next);
      if (res.ok) {
        setMsg({ kind: "ok", text: "Password updated. You'll stay signed in." });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMsg({ kind: "err", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <span className="label-mono">Current password</span>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
          className="rounded-sm border border-line bg-white px-4 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-mono">New password (min 8 chars)</span>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-sm border border-line bg-white px-4 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-mono">Confirm new password</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-sm border border-line bg-white px-4 py-2.5 text-base"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        {msg ? (
          <p
            className={
              "text-sm " + (msg.kind === "ok" ? "text-success" : "text-danger")
            }
          >
            {msg.text}
          </p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending || !current || next.length < 8 || next !== confirm}
          className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
