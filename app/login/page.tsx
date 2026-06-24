import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in — 7GEN LMS",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="label-mono mb-3">7GEN LMS</div>
          <h1 className="heading-serif text-4xl text-navy">Welcome back.</h1>
          <p className="mt-3 text-base text-muted">
            Sign in with your work email and password.
          </p>
        </div>
        <div className="card-soft p-8">
          <LoginForm />
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-widest text-muted font-mono">
          Seven Generation Group
        </p>
      </div>
    </div>
  );
}
