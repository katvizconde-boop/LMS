import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-coral-deep"
      >
        Sign out
      </button>
    </form>
  );
}
