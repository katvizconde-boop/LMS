import Link from "next/link";
import { ProgramForm } from "@/components/admin/ProgramForm";

export const metadata = { title: "New program — Admin" };

export default function NewProgramPage() {
  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
          <div className="label-mono mb-4">
            <Link href="/admin/programs" className="text-cream/60 hover:text-gold">
              ← Programs
            </Link>
            <span className="mx-2">/</span>
            <span>New</span>
          </div>
          <h1 className="heading-serif text-4xl sm:text-5xl">
            Create a new program.
          </h1>
        </div>
      </header>
      <section className="mx-auto max-w-[800px] px-6 py-12 sm:px-8">
        <ProgramForm mode="create" />
      </section>
    </main>
  );
}
