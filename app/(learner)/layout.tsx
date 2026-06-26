import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SideNav } from "@/components/learner/SideNav";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const showAdminNav = user.role === "ADMIN";
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SideNav
        showAdminNav={showAdminNav}
        userName={user.name ?? ""}
        userEmail={user.email ?? ""}
        userRoleLabel={showAdminNav ? "Admin" : "Learner"}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
