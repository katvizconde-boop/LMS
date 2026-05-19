import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ModuleForm } from "@/components/admin/ModuleForm";

type Params = { id: string };

export const metadata = { title: "New module — Admin" };

export default async function NewModulePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const program = await db.program.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });
  if (!program) notFound();

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
          <div className="label-mono mb-4">
            <Link
              href={`/admin/programs/${program.id}`}
              className="text-cream/60 hover:text-gold"
            >
              ← {program.title}
            </Link>
            <span className="mx-2">/</span>
            <span>New module</span>
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl">New module.</h1>
        </div>
      </header>
      <section className="mx-auto max-w-[800px] px-6 py-12 sm:px-8">
        <ModuleForm mode="create" programId={program.id} />
      </section>
    </main>
  );
}
