import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TopBar } from "@/components/learner/TopBar";
import { NameForm, PasswordForm } from "@/components/learner/ProfileForms";

export const metadata = { title: "Profile — Seven Generation Learning" };

const ROLE_LABEL: Record<string, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: {
      entity: { select: { code: true, name: true } },
      manager: { select: { name: true, email: true } },
    },
  });

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <header className="bg-navy text-cream">
          <div className="mx-auto max-w-[800px] px-6 py-16 sm:px-8 sm:py-20">
            <div className="label-mono mb-6">Your Profile</div>
            <h1 className="heading-serif text-4xl sm:text-6xl">
              {user.name ?? user.email}
            </h1>
            <p className="mt-4 text-base text-cream/70">{user.email}</p>
            <div className="mt-8 flex flex-wrap gap-6 border-t border-gold/30 pt-6">
              <Meta label="Role" value={ROLE_LABEL[user.role] ?? user.role} />
              <Meta label="Entity" value={user.entity?.name ?? "—"} />
              <Meta
                label="Manager"
                value={user.manager?.name ?? user.manager?.email ?? "—"}
              />
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-[800px] gap-10 px-6 py-12 sm:px-8">
          <div className="rounded border border-line bg-white p-6">
            <h2 className="label-mono mb-4">Your name</h2>
            <NameForm initialName={user.name ?? ""} />
          </div>
          <div className="rounded border border-line bg-white p-6">
            <h2 className="label-mono mb-4">Change password</h2>
            <PasswordForm />
          </div>
          <p className="text-center text-xs text-muted">
            Need to change your email, role, or manager? Ask your HR admin.
          </p>
        </section>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
        {label}
      </span>
      <span className="text-base font-medium text-cream">{value}</span>
    </div>
  );
}
