import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

type Props = {
  context?: { label: string; rightSlot?: React.ReactNode } | null;
};

export async function TopBar({ context = null }: Props) {
  const session = await auth();
  const userName = session?.user?.name ?? "";
  const userEmail = session?.user?.email ?? "";
  const display = userName || userEmail;
  const role = session?.user?.role;
  const roleLabel = role === "ADMIN" ? "Admin" : "Learner";

  return (
    <div className="sticky top-0 z-40 border-b border-line-cool bg-surface/90 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-3.5 sm:px-8">
        {/* Mobile logo */}
        <Link
          href="/dashboard"
          className="font-serif text-lg tracking-tight text-navy md:hidden"
        >
          7<span className="text-coral">GEN</span> LMS
        </Link>

        {/* Search */}
        <form
          action="/search"
          method="get"
          className="hidden flex-1 max-w-md sm:flex"
        >
          <label className="flex w-full items-center gap-2 rounded-full bg-surface-alt px-4 py-2 text-sm text-navy ring-1 ring-line-cool focus-within:ring-coral-soft">
            <Search className="h-4 w-4 text-muted" />
            <input
              name="q"
              type="text"
              placeholder="Search anything"
              className="w-full bg-transparent text-sm placeholder:text-muted focus:outline-none"
            />
          </label>
        </form>

        {context ? (
          <div className="hidden items-center gap-3 lg:flex">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted whitespace-nowrap">
              {context.label}
            </span>
            {context.rightSlot}
          </div>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          {session ? (
            <Link
              href="/kudos"
              aria-label="Kudos"
              className="hidden rounded-full bg-surface-alt p-2 text-navy-soft hover:bg-coral-bg hover:text-coral-deep sm:inline-flex"
            >
              <Bell className="h-4 w-4" />
            </Link>
          ) : null}
          {session ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-surface-alt px-2 py-1 pl-1 hover:bg-coral-bg"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-[11px] font-semibold text-white">
                {initials(display)}
              </span>
              <span className="hidden text-sm font-medium text-navy sm:inline">
                {firstName(display)}
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted lg:inline">
                {roleLabel}
              </span>
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function initials(s: string) {
  return s
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function firstName(s: string) {
  return s.split(/[\s@.]+/)[0] ?? s;
}
