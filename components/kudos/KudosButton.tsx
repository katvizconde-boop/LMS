"use client";

import { useOptimistic, useTransition } from "react";
import { toggleKudos } from "@/lib/actions/kudos";

type Props = {
  recipientId: string;
  moduleId: string;
  initialGiven: boolean;
  initialCount: number;
  isSelf: boolean;
};

export function KudosButton({
  recipientId,
  moduleId,
  initialGiven,
  initialCount,
  isSelf,
}: Props) {
  const [optimistic, setOptimistic] = useOptimistic({
    given: initialGiven,
    count: initialCount,
  });
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (isSelf) return;
    startTransition(async () => {
      const nextGiven = !optimistic.given;
      setOptimistic({
        given: nextGiven,
        count: optimistic.count + (nextGiven ? 1 : -1),
      });
      await toggleKudos(recipientId, moduleId);
    });
  }

  if (isSelf) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
        👏 {optimistic.count} {optimistic.count === 1 ? "kudo" : "kudos"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all disabled:opacity-60 " +
        (optimistic.given
          ? "border-gold bg-gold text-navy hover:opacity-90"
          : "border-line bg-white text-navy-soft hover:border-gold hover:text-navy")
      }
      aria-label={
        optimistic.given ? "Remove your kudos" : "Congratulate this person"
      }
    >
      <span aria-hidden>👏</span>
      <span>
        {optimistic.given ? "Kudo'd" : "Congratulate"}
        {optimistic.count > 0 ? ` · ${optimistic.count}` : ""}
      </span>
    </button>
  );
}
