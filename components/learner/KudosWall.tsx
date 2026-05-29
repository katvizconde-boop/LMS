"use client";

import { useOptimistic, useTransition } from "react";
import { sendKudos } from "@/lib/actions/kudos";

type Finish = {
  userId: string;
  userName: string | null;
  userEmail: string;
  userDepartment: string | null;
  moduleId: string;
  moduleNumber: string;
  moduleTitle: string;
  programTitle: string;
  completedAt: string; // ISO
  kudosCount: number;
  /** Has the current viewer already kudos'd this completion? */
  iKudosed: boolean;
  /** Is the current viewer the same person who finished? */
  isSelf: boolean;
};

type Props = {
  finishes: Finish[];
};

export function KudosWall({ finishes }: Props) {
  if (finishes.length === 0) {
    return (
      <div className="card-soft p-8 text-center">
        <div className="label-mono mb-3">Kudos Wall</div>
        <p className="heading-serif text-2xl text-navy">No finishes yet.</p>
        <p className="mt-2 text-sm text-muted">
          Once teammates start completing modules, you&rsquo;ll see them here —
          and can send a 👏.
        </p>
      </div>
    );
  }

  return (
    <div className="card-soft p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="label-mono">Kudos Wall</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {finishes.length} recent
        </span>
      </div>
      <ul className="flex flex-col gap-4">
        {finishes.map((f) => (
          <li key={f.userId + "-" + f.moduleId}>
            <Row finish={f} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ finish }: { finish: Finish }) {
  const [optimistic, addOptimistic] = useOptimistic(
    { count: finish.kudosCount, iKudosed: finish.iKudosed },
    (state, action: { emoji: string }) => ({
      count: state.iKudosed ? state.count : state.count + 1,
      iKudosed: true,
    }),
  );
  const [pending, startTransition] = useTransition();

  function celebrate(emoji: string) {
    if (finish.isSelf) return;
    startTransition(() => {
      addOptimistic({ emoji });
      // fire-and-forget server confirmation
      sendKudos(finish.userId, finish.moduleId, emoji);
    });
  }

  const name = finish.userName ?? finish.userEmail;
  const firstName = name.split(" ")[0];
  const subtitle = [finish.moduleNumber, finish.programTitle]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line/60 bg-cream/30 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-base text-navy">
          <span className="font-semibold">{firstName}</span> finished{" "}
          <span className="font-semibold">Module {finish.moduleNumber}</span>{" "}
          — <span className="italic">{finish.moduleTitle}</span>
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          {finish.programTitle}
          {finish.userDepartment ? ` · ${finish.userDepartment}` : ""}
          {" · "}
          {relativeTime(new Date(finish.completedAt))}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {finish.isSelf ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
            That&rsquo;s you 🎉
          </span>
        ) : (
          <>
            {(["👏", "🎉", "🔥"] as const).map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={pending || optimistic.iKudosed}
                onClick={() => celebrate(emoji)}
                aria-label={`Send ${emoji} kudos`}
                className={
                  "rounded-full border px-2.5 py-1 text-base transition-all disabled:cursor-default " +
                  (optimistic.iKudosed
                    ? "border-gold/40 bg-cream-deep opacity-70"
                    : "border-line bg-white hover:border-gold hover:scale-110")
                }
              >
                {emoji}
              </button>
            ))}
            <span className="font-mono text-xs text-muted tabular-nums">
              {optimistic.count}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function relativeTime(date: Date): string {
  const ms = Date.now() - date.getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
