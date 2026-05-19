"use client";

import { useState, useTransition } from "react";
import { createProgram, updateProgram } from "@/lib/actions/admin-programs";

type Props = {
  mode: "create" | "edit";
  program?: {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
  };
};

function isoDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function ProgramForm({ mode, program }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createProgram(fd)
          : await updateProgram(program!.id, fd);
      if (!res || ("ok" in res && !res.ok)) {
        setError(("error" in res ? res.error : null) ?? "Save failed.");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded border border-line bg-white p-6 sm:grid-cols-2"
    >
      <Field label="Title" required className="sm:col-span-2">
        <input
          name="title"
          required
          defaultValue={program?.title ?? ""}
          placeholder="e.g. Manager Foundations"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      {mode === "create" ? (
        <Field label="Slug (auto from title if blank)">
          <input
            name="slug"
            placeholder="manager-foundations"
            className="rounded-sm border border-line bg-white px-3 py-2 text-base font-mono text-sm"
          />
        </Field>
      ) : (
        <Field label="Slug">
          <input
            value={program?.slug ?? ""}
            disabled
            className="rounded-sm border border-line bg-cream-deep px-3 py-2 text-base font-mono text-sm text-muted"
          />
        </Field>
      )}
      <Field label="Subtitle" className={mode === "edit" ? "" : "sm:col-span-1"}>
        <input
          name="subtitle"
          defaultValue={program?.subtitle ?? ""}
          placeholder="One-line teaser"
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <textarea
          name="description"
          rows={3}
          defaultValue={program?.description ?? ""}
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="Start date">
        <input
          type="date"
          name="startDate"
          defaultValue={isoDate(program?.startDate)}
          className="rounded-sm border border-line bg-white px-3 py-2 text-base"
        />
      </Field>
      <Field label="End date">
        <input
          type="date"
          name="endDate"
          defaultValue={isoDate(program?.endDate)}
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
              ? "Create program"
              : "Save changes"}
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
