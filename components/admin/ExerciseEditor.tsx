"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertExercise, deleteExercise } from "@/lib/actions/admin-exercise";

type Instructions = {
  intro?: string;
  steps: string[];
  deadlineNote?: string;
};

type Exercise = {
  title: string | null;
  instructions: Instructions;
  deadlineOffsetDays: number | null;
};

type Props = {
  moduleId: string;
  exercise: Exercise | null;
};

export function ExerciseEditor({ moduleId, exercise }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(exercise?.title ?? "");
  const [intro, setIntro] = useState(exercise?.instructions.intro ?? "");
  const [steps, setSteps] = useState(
    (exercise?.instructions.steps ?? []).join("\n"),
  );
  const [deadlineNote, setDeadlineNote] = useState(
    exercise?.instructions.deadlineNote ?? "",
  );
  const [deadlineOffsetDays, setDeadlineOffsetDays] = useState(
    exercise?.deadlineOffsetDays?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    const stepArr = steps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    startTransition(async () => {
      const res = await upsertExercise(moduleId, {
        title: title.trim() || null,
        intro: intro.trim() || null,
        steps: stepArr,
        deadlineNote: deadlineNote.trim() || null,
        deadlineOffsetDays: deadlineOffsetDays
          ? parseInt(deadlineOffsetDays, 10) || null
          : null,
      });
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        setMsg("Saved.");
      }
    });
  }

  function onDelete() {
    if (!confirm("Remove the exercise from this module? All submissions go too.")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteExercise(moduleId);
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        setTitle("");
        setIntro("");
        setSteps("");
        setDeadlineNote("");
        setDeadlineOffsetDays("");
        setMsg("Exercise removed.");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded border border-line bg-white p-5"
    >
      <Field label="Title (optional)">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module 01 — Submission"
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Intro paragraph (optional)">
        <textarea
          rows={2}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Steps (one per line)" required>
        <textarea
          rows={5}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Have one real conversation with Claude…&#10;In 3–5 sentences describe what worked…"
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm font-mono"
          required
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Deadline note (shown to learner)">
          <input
            value={deadlineNote}
            onChange={(e) => setDeadlineNote(e.target.value)}
            placeholder="Deadline: end of June 2026"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Deadline offset (days from unlock)">
          <input
            type="number"
            min={0}
            value={deadlineOffsetDays}
            onChange={(e) => setDeadlineOffsetDays(e.target.value)}
            placeholder="30"
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {exercise ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="mr-auto text-sm text-danger hover:underline disabled:opacity-50"
          >
            Remove exercise
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold disabled:opacity-50"
        >
          {pending ? "Saving…" : exercise ? "Save exercise" : "Add exercise"}
        </button>
      </div>
      {msg ? <p className="text-sm text-success">{msg}</p> : null}
      {error ? (
        <p className="rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
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
