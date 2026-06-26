import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SideNav } from "@/components/learner/SideNav";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const user = session.user;
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SideNav
        showAdminNav
        userName={user.name ?? ""}
        userEmail={user.email ?? ""}
        userRoleLabel="Admin"
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
