"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { approveSubmission, requestRevision } from "@/lib/actions/review";

type Props = {
  submission: {
    id: string;
    content: string;
    submittedAt: string; // serialized
    user: {
      name: string | null;
      email: string;
      entity: { code: string } | null;
    };
    module: {
      number: string;
      title: string;
      program: { slug: string; title: string };
    };
  };
};

export function ReviewCard({ submission }: Props) {
  const [mode, setMode] = useState<"idle" | "revising">("idle");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveSubmission(submission.id);
      if (!res.ok) setError(res.error);
    });
  }

  function onRequestRevision(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestRevision(submission.id, notes);
      if (!res.ok) setError(res.error);
      else setMode("idle");
    });
  }

  return (
    <article className="rounded border border-line bg-white p-6 shadow-[0_2px_12px_rgba(26,35,50,0.04)]">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="heading-serif text-2xl text-navy">
            {submission.user.name ?? submission.user.email}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {new Date(submission.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm text-muted">{submission.user.email}</p>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          {submission.user.entity ? <span>{submission.user.entity.code}</span> : null}
          <span>
            {submission.module.program.title} · Module {submission.module.number}
          </span>
        </div>
      </header>

      <div className="my-5 whitespace-pre-wrap text-sm leading-relaxed text-navy-soft">
        {submission.content}
      </div>

      {mode === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-sm bg-success px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> {pending ? "Approving…" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setMode("revising")}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-sm border border-line bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-cream disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Request revision
          </button>
        </div>
      ) : (
        <form onSubmit={onRequestRevision} className="flex flex-col gap-3">
          <label className="label-mono">Notes for the learner</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            placeholder="Tell them what to revise — be specific."
            className="w-full rounded-sm border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setNotes("");
                setError(null);
              }}
              disabled={pending}
              className="text-sm text-muted underline-offset-4 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || notes.trim().length < 5}
              className="rounded-sm bg-navy px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-cream transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send revision request"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p className="mt-4 rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </article>
  );
}
