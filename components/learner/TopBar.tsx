import Link from "next/link";
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
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-3.5 sm:px-8">
        <Link
          href="/dashboard"
          className="font-mono text-[11px] uppercase tracking-widest text-gold hover:opacity-90"
        >
          Seven Generation <span className="text-cream">/&nbsp;Learning</span>
        </Link>
        {context ? (
          <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
            <span className="font-mono text-[11px] uppercase tracking-widest text-cream/80 whitespace-nowrap">
              {context.label}
            </span>
            {context.rightSlot}
          </div>
        ) : null}
        <nav className="flex items-center gap-5">
          {showManagerNav ? (
            <>
              <Link
                href="/team"
                className="font-mono text-[11px] uppercase tracking-widest text-cream/80 hover:text-gold"
              >
                Team
              </Link>
              <Link
                href="/reviews"
                className="font-mono text-[11px] uppercase tracking-widest text-cream/80 hover:text-gold"
              >
                Reviews
              </Link>
            </>
          ) : null}
          {showAdminNav ? (
            <Link
              href="/admin/dashboard"
              className="font-mono text-[11px] uppercase tracking-widest text-gold hover:opacity-90"
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
