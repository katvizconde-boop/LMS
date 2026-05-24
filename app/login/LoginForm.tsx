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
          className="w-full rounded-sm border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none"
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
          className="w-full rounded-sm border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none"
        />
      </label>
      {state.error ? (
        <p className="rounded-sm bg-danger-bg border-l-2 border-danger px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-navy hover:text-gold disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-2 text-xs text-muted">
        Forgot your password? Ask your HR admin to reset it.
      </p>
    </form>
  );
}
