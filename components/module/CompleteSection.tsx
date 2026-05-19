"use client";

import { useState } from "react";

type Props = {
  moduleNumber: string;
};

/**
 * Phase 1: client-only state. Wire to ModuleProgress server action in Phase 2.
 */
export function CompleteSection({ moduleNumber }: Props) {
  const [done, setDone] = useState(false);
  return (
    <section className="border-b border-line py-20 last:border-b-0">
      <div className="mx-auto max-w-[800px] px-6 sm:px-8">
        <div className="rounded border-2 border-gold bg-white p-8 text-center">
          <h3 className="mb-3 font-serif text-3xl font-normal text-navy">
            Ready to mark this module complete?
          </h3>
          <p className="mb-6 text-[15px] text-muted">
            Click below once you&rsquo;ve finished the reading, the knowledge
            check, and your reflection.
          </p>
          <button
            type="button"
            onClick={() => setDone(true)}
            disabled={done}
            className={
              done
                ? "cursor-default rounded-sm bg-success px-9 py-3.5 text-sm font-semibold uppercase tracking-wider text-white"
                : "rounded-sm bg-gold px-9 py-3.5 text-sm font-semibold uppercase tracking-wider text-navy transition-colors hover:bg-navy hover:text-gold"
            }
          >
            {done ? "✓ Module " + moduleNumber + " Complete" : "Mark Module " + moduleNumber + " Complete"}
          </button>
        </div>
      </div>
    </section>
  );
}
