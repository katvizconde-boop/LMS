"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  moveQuiz,
} from "@/lib/actions/admin-quizzes";

type Quiz = {
  id: string;
  position: number;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
};

type Props = {
  moduleId: string;
  quizzes: Quiz[];
};

export function QuizList({ moduleId, quizzes }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onMove(id: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveQuiz(id, dir);
      router.refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this quiz?")) return;
    startTransition(async () => {
      await deleteQuiz(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {quizzes.length === 0 ? (
        <p className="rounded border border-dashed border-line bg-cream-deep p-6 text-center text-sm text-muted">
          No quizzes yet. Add one below to test knowledge.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {quizzes.map((q, i) => (
            <li key={q.id}>
              {editingId === q.id ? (
                <QuizForm
                  mode="edit"
                  moduleId={moduleId}
                  quiz={q}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-3 rounded border border-line bg-white p-4">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onMove(q.id, "up")}
                      disabled={i === 0 || pending}
                      className="rounded-sm border border-line p-1 text-muted hover:bg-cream disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(q.id, "down")}
                      disabled={i === quizzes.length - 1 || pending}
                      className="rounded-sm border border-line p-1 text-muted hover:bg-cream disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        Q{q.position}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                        {q.options.length} options
                      </span>
                    </div>
                    <p className="mt-1 text-base font-medium text-navy">
                      {q.question}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Correct: <span className="font-mono">{q.options[q.correctIndex]}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(q.id)}
                      className="font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(q.id)}
                      disabled={pending}
                      className="text-danger hover:opacity-80 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <QuizForm
          mode="create"
          moduleId={moduleId}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start rounded-sm bg-gold px-4 py-2 font-mono text-xs uppercase tracking-widest text-navy hover:bg-navy hover:text-gold"
        >
          + Add quiz
        </button>
      )}
    </div>
  );
}

function QuizForm({
  mode,
  moduleId,
  quiz,
  onDone,
}: {
  mode: "create" | "edit";
  moduleId: string;
  quiz?: Quiz;
  onDone: () => void;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState(quiz?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    quiz?.options ?? ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState(quiz?.correctIndex ?? 0);
  const [feedback, setFeedback] = useState(quiz?.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setOption(i: number, value: string) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((opts) => [...opts, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((opts) => opts.filter((_, idx) => idx !== i));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const data = { question, options, correctIndex, feedback };
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createQuiz(moduleId, data)
          : await updateQuiz(quiz!.id, data);
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        onDone();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded border border-gold bg-white p-5">
      <Field label="Question" required>
        <textarea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
        />
      </Field>

      <div className="mt-4">
        <p className="label-mono mb-2">Options (radio = correct answer)</p>
        <ul className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="h-4 w-4 accent-gold"
              />
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 rounded-sm border border-line bg-white px-3 py-2 text-sm"
                required
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-danger hover:opacity-80"
                  aria-label="Remove option"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {options.length < 6 ? (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gold underline-offset-4 hover:underline"
          >
            + Add option
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <Field label="Feedback (shown after the learner answers)" required>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            className="rounded-sm border border-line bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="text-sm text-muted hover:underline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-wider text-navy hover:bg-navy hover:text-gold disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Add quiz" : "Save"}
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
