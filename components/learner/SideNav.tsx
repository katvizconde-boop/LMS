"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  Search,
  User as UserIcon,
  ClipboardCheck,
  Settings,
  Heart,
  Menu,
  X,
} from "lucide-react";

type Props = {
  showAdminNav: boolean;
  userName: string;
  userEmail: string;
  userRoleLabel: string;
};

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
};

export function SideNav({
  showAdminNav,
  userName,
  userEmail,
  userRoleLabel,
}: Props) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const items: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/programs",
      label: "Programs",
      icon: GraduationCap,
      matchPrefix: "/programs",
    },
    { href: "/kudos", label: "Kudos Wall", icon: Heart },
    { href: "/search", label: "Search", icon: Search },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  const adminItems: Item[] = [
    {
      href: "/reviews",
      label: "Reviews",
      icon: ClipboardCheck,
      matchPrefix: "/reviews",
    },
    {
      href: "/admin/dashboard",
      label: "Admin",
      icon: Settings,
      matchPrefix: "/admin",
    },
  ];

  const isActive = (it: Item) => {
    const target = it.matchPrefix ?? it.href;
    return pathname === it.href || pathname.startsWith(target + "/");
  };

  const navBody = (
    <>
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-2 px-2 text-navy"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="font-serif text-xl tracking-tight">
          7<span className="text-coral">GEN</span> LMS
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <NavLink key={it.href} item={it} active={isActive(it)} />
        ))}
      </nav>

      {showAdminNav ? (
        <>
          <div className="my-5 px-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            Admin
          </div>
          <nav className="flex flex-col gap-1">
            {adminItems.map((it) => (
              <NavLink key={it.href} item={it} active={isActive(it)} />
            ))}
          </nav>
        </>
      ) : null}

      <div className="mt-auto rounded-2xl bg-coral-bg p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-sm font-semibold text-white">
            {initials(userName, userEmail)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">
              {userName || userEmail}
            </p>
            <p className="truncate text-xs text-muted">{userRoleLabel}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col border-r border-line-cool bg-surface px-4 py-6 md:flex">
        {navBody}
      </aside>

      {/* Mobile top bar (logo + hamburger) */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-line-cool bg-surface px-4 py-3 md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-navy"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-serif text-lg tracking-tight">
            7<span className="text-coral">GEN</span> LMS
          </span>
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl bg-coral-bg p-2 text-coral-deep"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-surface px-4 py-6 shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-xl bg-coral-bg p-2 text-coral-deep"
            >
              <X className="h-5 w-5" />
            </button>
            {navBody}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function NavLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`nav-item ${active ? "nav-item-active" : ""}`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function initials(name: string, email: string) {
  const src = name || email;
  return src
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
