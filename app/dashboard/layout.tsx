"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        style={{ background: "var(--sidebar-bg)", width: "240px", flexShrink: 0 }}
        className="flex flex-col"
      >
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-white font-bold text-lg">Sponge Ads</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>
            <DashIcon /> Overview
          </NavLink>
          <NavLink
            href="/dashboard/ads"
            active={pathname.startsWith("/dashboard/ads")}
          >
            <AdsIcon /> Ads
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
          <UserButton />
          <span className="text-slate-400 text-sm">Account</span>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`sidebar-link ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function AdsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M8 12h.01" />
      <path d="M16 12h.01" />
    </svg>
  );
}
