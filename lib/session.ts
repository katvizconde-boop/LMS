import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Server-side: ensure there's a signed-in session, or redirect to /login.
 *
 * Use this in any server component / route handler that needs a session.
 * Replaces the unsafe `(await auth())!` non-null assertion which would crash
 * with a TypeError if the session goes null mid-request (e.g. during sign-out).
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}
