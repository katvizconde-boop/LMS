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
        <div className="rounded border-2 border-gold bg-white p-8 text-center">
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
                ? "cursor-default rounded-sm bg-success px-9 py-3.5 text-sm font-semibold uppercase tracking-wider text-white"
                : "rounded-sm bg-gold px-9 py-3.5 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-navy hover:text-gold disabled:opacity-60"
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
