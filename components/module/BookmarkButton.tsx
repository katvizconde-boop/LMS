"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark } from "@/lib/actions/bookmark";

type Props = {
  moduleId: string;
  bookmarked: boolean;
};

export function BookmarkButton({ moduleId, bookmarked }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(bookmarked);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      const res = await toggleBookmark(moduleId);
      if (!res.ok) {
        // Revert via state from server on next render.
        console.error(res.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={optimistic ? "Remove bookmark" : "Bookmark this module"}
      className={
        "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 " +
        (optimistic
          ? "border-gold bg-gold text-navy hover:bg-cream"
          : "border-cream/30 text-cream/80 hover:border-gold hover:text-gold")
      }
    >
      {optimistic ? (
        <>
          <BookmarkCheck className="h-3.5 w-3.5" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-3.5 w-3.5" />
          Save
        </>
      )}
    </button>
  );
}
