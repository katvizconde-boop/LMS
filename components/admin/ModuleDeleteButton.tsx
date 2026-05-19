"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteModule } from "@/lib/actions/admin-modules";

export function ModuleDeleteButton({ moduleId }: { moduleId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm("Delete this module? All sections, quizzes, and submissions go with it.")) {
      return;
    }
    startTransition(async () => {
      await deleteModule(moduleId);
      router.push(`./`);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-sm border border-danger bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-danger hover:bg-danger-bg disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
