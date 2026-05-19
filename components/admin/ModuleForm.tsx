"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createModule, updateModule } from "@/lib/actions/admin-modules";

type Props = {
  mode: "create" | "edit";
  programId: string;
  mod?: {
    id: string;
    number: string;
    title: string;
    subtitle: string | null;
    heroSubtitle: string | null;
    level: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED" | "MASTERY";
    durationMinutes: number | null;
    audienceLabel: string | null;
    availableFrom: Date | string | null;
    learningObjectives: unknown;
  };
};

function isoDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function ModuleForm({ mode, programId, mod }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const objectivesText = Array.isArray(mod?.learningObjectives)
    ? (mod!.learningObjectives as string[]).join("\n")
    : "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createModule(programId, fd)
          : await updateModule(mod!.id, fd);
      if (!res || ("ok" in res && !res.ok)) {
        setError(("error" in res ? res.error : null) ?? "Save failed.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded border border-line bg-white p-6 sm:grid-cols-2"
    >
      <Field label="Number" required>
        <input
          name="number"
          required
          defaultValue={mod?.number ?? ""}
          placeholder="01"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base font-mono"
        />
      </Field>
      <Field label="Level" required>
        <select
          name="level"
          defaultValue={mod?.level ?? "FOUNDATION"}
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        >
          <option value="FOUNDATION">Foundation</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="MASTERY">Mastery</option>
        </select>
      </Field>
      <Field label="Title" required className="sm:col-span-2">
        <input
          name="title"
          required
          defaultValue={mod?.title ?? ""}
          placeholder="Meet Claude."
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Subtitle (card)" className="sm:col-span-2">
        <input
          name="subtitle"
          defaultValue={mod?.subtitle ?? ""}
          placeholder="One-line description shown on cards"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Hero subtitle (module page)" className="sm:col-span-2">
        <textarea
          name="heroSubtitle"
          rows={2}
          defaultValue={mod?.heroSubtitle ?? ""}
          placeholder="Longer description shown in the navy hero block"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Duration (minutes)">
        <input
          type="number"
          name="durationMinutes"
          min={0}
          defaultValue={mod?.durationMinutes ?? ""}
          placeholder="35"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Available from">
        <input
          type="date"
          name="availableFrom"
          defaultValue={isoDate(mod?.availableFrom)}
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Audience label" className="sm:col-span-2">
        <input
          name="audienceLabel"
          defaultValue={mod?.audienceLabel ?? ""}
          placeholder="All employees — M2, MMI, RDB"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field
        label="Learning objectives (one per line)"
        className="sm:col-span-2"
      >
        <textarea
          name="learningObjectives"
          rows={5}
          defaultValue={objectivesText}
          placeholder="Understand what Claude is&#10;Access Claude through your company account"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-navy transition-colors hover:bg-navy hover:text-gold disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create module"
              : "Save module"}
        </button>
      </div>
      {error ? (
        <p className="rounded-sm border-l-2 border-danger bg-danger-bg px-3 py-2 text-sm text-danger sm:col-span-2">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="label-mono">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
