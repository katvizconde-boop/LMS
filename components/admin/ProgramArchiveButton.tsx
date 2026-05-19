"use client";

import { useTransition } from "react";
import { archiveProgram, unarchiveProgram } from "@/lib/actions/admin-programs";

type Props = {
  programId: string;
  archived: boolean;
};

export function ProgramArchiveButton({ programId, archived }: Props) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (
      !confirm(
        archived
          ? "Restore this program? It'll be visible to learners again."
          : "Archive this program? Learners won't see it on their dashboard.",
      )
    )
      return;
    startTransition(async () => {
      if (archived) await unarchiveProgram(programId);
      else await archiveProgram(programId);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        archived
          ? "rounded-sm border border-line bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-navy hover:bg-cream disabled:opacity-50"
          : "rounded-sm border border-danger bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-danger hover:bg-danger-bg disabled:opacity-50"
      }
    >
      {pending ? "…" : archived ? "Restore" : "Archive"}
    </button>
  );
}
