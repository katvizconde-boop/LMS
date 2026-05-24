"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { recordQuizAnswer } from "@/lib/actions/quiz";

type Props = {
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
  /** If the learner has already answered, pass their stored choice for hydration. */
  priorChoice?: number | null;
};

export function QuizBlock({
  quizId,
  question,
  options,
  correctIndex,
  feedback,
  priorChoice = null,
}: Props) {
  const [chosen, setChosen] = useState<number | null>(priorChoice);
  const [pending, startTransition] = useTransition();

  function handleClick(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    startTransition(async () => {
      await recordQuizAnswer(quizId, i);
    });
  }

  const isCorrect = chosen === correctIndex;

  return (
    <div className="card-soft my-8 p-8 sm:p-9">
      <p className="mb-5 text-lg font-semibold text-navy">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const state =
            chosen === null
              ? "default"
              : i === correctIndex
                ? "correct"
                : i === chosen
                  ? "incorrect"
                  : "muted";
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(i)}
              disabled={chosen !== null || pending}
              className={cn(
                "rounded-xl border px-5 py-3.5 text-left text-[15px] transition-all",
                state === "default" &&
                  "cursor-pointer border-line bg-white text-ink hover:border-gold hover:bg-cream hover:shadow-sm",
                state === "correct" &&
                  "cursor-default border-success/40 bg-success-bg font-semibold text-success",
                state === "incorrect" &&
                  "cursor-default border-danger/40 bg-danger-bg text-danger",
                state === "muted" &&
                  "cursor-default border-line bg-white text-muted",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {chosen !== null ? (
        <div
          className={cn(
            "mt-5 rounded-xl border px-5 py-4 text-sm",
            isCorrect
              ? "border-success/30 bg-success-bg text-[#2A4F35]"
              : "border-danger/30 bg-danger-bg text-[#6B2A2A]",
          )}
        >
          {isCorrect ? feedback : `Not quite. ${feedback}`}
        </div>
      ) : null}
    </div>
  );
}
