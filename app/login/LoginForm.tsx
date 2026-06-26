"use client";

import { useActionState, useRef } from "react";
import { passwordSignIn, type LoginState } from "./actions";

const initial: LoginState = {};

const DEMO_LOGINS = [
  {
    label: "Admin / HR",
    email: "kat.vizconde@seven-gen.com",
    password: "Welcome2026!",
  },
  {
    label: "Learner",
    email: "manager.demo@seven-gen.com",
    password: "Welcome2026!",
  },
];

export function LoginForm({
  showDemoLogins = false,
}: {
  showDemoLogins?: boolean;
}) {
  const [state, action, pending] = useActionState(passwordSignIn, initial);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function fillDemo(email: string, password: string) {
    if (emailRef.current) emailRef.current.value = email;
    if (passwordRef.current) passwordRef.current.value = password;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="label-mono">Work Email</span>
        <input
          ref={emailRef}
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          inputMode="email"
          defaultValue={state.email ?? ""}
          placeholder="you@seven-gen.com"
          className="w-full rounded-xl border border-line-cool bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label-mono">Password</span>
        <input
          ref={passwordRef}
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          className="w-full rounded-xl border border-line-cool bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
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

      {showDemoLogins ? (
      <div className="mt-4 rounded-2xl bg-coral-bg/60 p-4">
        <p className="label-mono mb-3 text-center">Demo logins</p>
        <div className="flex flex-col gap-2">
          {DEMO_LOGINS.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fillDemo(d.email, d.password)}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-left text-xs ring-1 ring-line-cool transition-colors hover:bg-coral-bg hover:ring-coral-soft"
            >
              <span>
                <span className="block font-semibold text-navy">{d.label}</span>
                <span className="block font-mono text-[10px] text-muted">
                  {d.email}
                </span>
              </span>
              <span className="rounded-full bg-coral-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-coral-deep">
                Fill
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
          Password: Welcome2026!
        </p>
      </div>
      ) : null}

      <p className="mt-2 text-xs text-muted">
        Forgot your password? Ask your HR admin to reset it.
      </p>
    </form>
  );
}
