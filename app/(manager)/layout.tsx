import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Admin-only: only HR/L&D can review submissions and see everyone's progress.
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <>{children}</>;
}
