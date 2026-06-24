import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SideNav } from "@/components/learner/SideNav";
import { TopBar } from "@/components/learner/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const user = session.user;
  return (
    <div className="flex min-h-screen">
      <SideNav
        showAdminNav
        userName={user.name ?? ""}
        userEmail={user.email ?? ""}
        userRoleLabel="Admin"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="border-b border-line-cool bg-surface-alt">
          <nav className="flex gap-6 overflow-x-auto px-6 py-3 sm:px-8">
            <AdminTab href="/admin/dashboard" label="Dashboard" />
            <AdminTab href="/admin/programs" label="Programs" />
            <AdminTab href="/admin/users" label="Users" />
            <AdminTab href="/admin/export" label="Export" />
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-mono text-[11px] uppercase tracking-widest text-navy-soft hover:text-coral-deep whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
