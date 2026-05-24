import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in — Seven Generation Learning",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="label-mono mb-3">Seven Generation / Learning</div>
          <h1 className="heading-serif text-4xl text-navy">Welcome back.</h1>
          <p className="mt-3 text-base text-muted">
            Sign in with your work email and password.
          </p>
        </div>
        <div className="rounded border border-line bg-white p-8 shadow-[0_2px_12px_rgba(26,35,50,0.04)]">
          <LoginForm />
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-widest text-muted font-mono">
          Seven Generation Group
        </p>
      </div>
    </div>
  );
}
