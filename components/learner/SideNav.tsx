"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  Search,
  User as UserIcon,
  ClipboardCheck,
  Settings,
  Heart,
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

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col border-r border-line-cool bg-surface px-4 py-6 md:flex">
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
    </aside>
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
