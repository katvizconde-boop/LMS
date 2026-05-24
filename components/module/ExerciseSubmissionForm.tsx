"use client";

import { useState, useTransition } from "react";
import { submitExercise } from "@/lib/actions/submission";
import type { SubmissionStatus } from "@prisma/client";

type Submission = {
  id: string;
  content: string;
  status: SubmissionStatus;
  reviewerNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
};

type Props = {
  moduleId: string;
  latestSubmission: Submission | null;
};

export function ExerciseSubmissionForm({ moduleId, latestSubmission }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isLocked =
    latestSubmission?.status === "PENDING" ||
    latestSubmission?.status === "APPROVED";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitExercise(moduleId, content);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setContent("");
    });
  }

  return (
    <div className="mt-8">
      {latestSubmission ? (
        <SubmissionStatusCard submission={latestSubmission} />
      ) : null}

      {!isLocked ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <label className="label-mono">
            {latestSubmission?.status === "REVISION_REQUESTED"
              ? "Resubmit"
              : "Your reflection"}
          </label>
          <textarea
            name="content"
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="In 3–5 sentences, describe what task you tried, what Claude got right, where it fell short, and one thing you'd do differently next time."
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted">
              {content.length}/5000
            </span>
            <button
              type="submit"
              disabled={pending || content.trim().length < 20}
              className="btn-pill btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
          </div>
          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function SubmissionStatusCard({ submission }: { submission: Submission }) {
  const meta = STATUS_META[submission.status];
  return (
    <div
      className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] uppercase tracking-widest ${meta.text}`}>
          {meta.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {submission.submittedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-navy-soft">
        {submission.content}
      </p>
      {submission.reviewerNotes ? (
        <div className={`mt-4 rounded-xl border ${meta.border} bg-white/60 px-4 py-3`}>
          <div className="label-mono mb-1.5">Reviewer feedback</div>
          <p className="text-sm text-navy-soft">{submission.reviewerNotes}</p>
        </div>
      ) : null}
    </div>
  );
}

const STATUS_META: Record<
  SubmissionStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  PENDING: {
    label: "Submitted · Awaiting review",
    bg: "bg-cream-deep",
    border: "border-gold/30",
    text: "text-gold",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-success-bg",
    border: "border-success/30",
    text: "text-success",
  },
  REVISION_REQUESTED: {
    label: "Revision requested",
    bg: "bg-danger-bg",
    border: "border-danger/30",
    text: "text-danger",
  },
};
