import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

type Props = {
  context?: { label: string; rightSlot?: React.ReactNode } | null;
};

export async function TopBar({ context = null }: Props) {
  const session = await auth();
  const role = session?.user?.role;
  const showManagerNav = role === "MANAGER" || role === "ADMIN";
  const showAdminNav = role === "ADMIN";

  return (
    <div className="sticky top-0 z-40 border-b border-gold/40 bg-navy text-cream">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-8 sm:py-3.5">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center font-mono text-[11px] uppercase tracking-widest text-gold hover:opacity-90 whitespace-nowrap"
        >
          <span className="hidden sm:inline">
            Seven Generation <span className="text-cream">/&nbsp;Learning</span>
          </span>
          <span className="sm:hidden">
            7Gen <span className="text-cream">/&nbsp;Learning</span>
          </span>
        </Link>
        {context ? (
          <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
            <span className="font-mono text-[11px] uppercase tracking-widest text-cream/80 whitespace-nowrap">
              {context.label}
            </span>
            {context.rightSlot}
          </div>
        ) : null}
        <nav className="flex shrink-0 items-center gap-4 sm:gap-5">
          {session ? (
            <Link
              href="/search"
              aria-label="Search"
              className="text-cream/80 hover:text-gold"
            >
              <Search className="h-4 w-4" />
            </Link>
          ) : null}
          {showManagerNav ? (
            <>
              <Link
                href="/team"
                className="font-mono text-[11px] uppercase tracking-widest text-cream/80 hover:text-gold whitespace-nowrap"
              >
                Team
              </Link>
              <Link
                href="/reviews"
                className="font-mono text-[11px] uppercase tracking-widest text-cream/80 hover:text-gold whitespace-nowrap"
              >
                Reviews
              </Link>
            </>
          ) : null}
          {showAdminNav ? (
            <Link
              href="/admin/dashboard"
              className="font-mono text-[11px] uppercase tracking-widest text-gold hover:opacity-90 whitespace-nowrap"
            >
              Admin
            </Link>
          ) : null}
          <SignOutButton />
        </nav>
      </div>
    </div>
  );
}
