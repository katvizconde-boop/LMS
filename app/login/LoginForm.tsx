"use client";

import { useActionState } from "react";
import { passwordSignIn, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(passwordSignIn, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="label-mono">Work Email</span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          inputMode="email"
          defaultValue={state.email ?? ""}
          placeholder="you@seven-gen.com"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-mono">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </label>
      {state.error ? (
        <p className="rounded-xl bg-danger-bg border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-pill btn-primary disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-2 text-xs text-muted">
        Forgot your password? Ask your HR admin to reset it.
      </p>
    </form>
  );
}
