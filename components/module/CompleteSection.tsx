"use client";

import { useTransition } from "react";
import { markModuleComplete } from "@/lib/actions/module";

type Props = {
  moduleId: string;
  moduleNumber: string;
  completed: boolean;
};

export function CompleteSection({ moduleId, moduleNumber, completed }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (completed) return;
    startTransition(async () => {
      await markModuleComplete(moduleId);
    });
  }

  return (
    <section className="border-b border-line py-20 last:border-b-0">
      <div className="mx-auto max-w-[800px] px-6 sm:px-8">
        <div className="card-soft border-gold/40 p-10 text-center">
          <h3 className="mb-3 font-serif text-3xl font-normal text-navy">
            {completed
              ? "Module complete."
              : "Ready to mark this module complete?"}
          </h3>
          {!completed ? (
            <p className="mb-6 text-[15px] text-muted">
              Click below once you&rsquo;ve finished the reading, the knowledge
              check, and your reflection.
            </p>
          ) : (
            <p className="mb-6 text-[15px] text-muted">
              Nice work. This module is checked off on your dashboard.
            </p>
          )}
          <button
            type="button"
            onClick={handleClick}
            disabled={completed || pending}
            className={
              completed
                ? "btn-pill cursor-default bg-success text-white"
                : "btn-pill btn-primary disabled:opacity-60"
            }
          >
            {completed
              ? "✓ Module " + moduleNumber + " Complete"
              : pending
                ? "Saving…"
                : "Mark Module " + moduleNumber + " Complete"}
          </button>
        </div>
      </div>
    </section>
  );
}
