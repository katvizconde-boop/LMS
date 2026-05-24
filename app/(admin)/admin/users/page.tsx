import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { UserRow } from "@/components/admin/UserRow";
import { AddUserForm } from "@/components/admin/AddUserForm";

export const metadata = { title: "Users — Admin" };

export default async function UsersPage() {
  const session = await requireSession();
  const [users, entities] = await Promise.all([
    db.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    }),
    db.entity.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <main className="flex-1">
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-8 sm:py-20">
          <div className="label-mono mb-6">Admin / Users</div>
          <h1 className="heading-serif text-4xl sm:text-6xl">
            People.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/75">
            Manage roles, company, and team assignments.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {users.length} user{users.length === 1 ? "" : "s"}
          </p>
          <AddUserForm entities={entities} />
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              entities={entities}
              isSelf={u.id === session.user.id}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
