"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  ShoppingBag,
  Briefcase,
  FileEdit,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  adminClientHasPermission,
  clearClientAdminToken,
  readClientAdminProfile,
  readClientAdminToken,
  type AdminPermissionKey,
} from "@/lib/adminClientAuth";
import { ADMIN_BASE_PATH, pathnameWithoutBase } from "@/lib/adminBasePath";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  perm: AdminPermissionKey;
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { lang, t, toggle } = useAdminLanguage();
  const pathname = pathnameWithoutBase(usePathname());
  const params = useParams();
  const siteId = (params?.siteId as string) || "zevtabs";

  const navItems: NavItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, perm: "dashboard" },
    { href: "/site-content", label: t.nav.siteContent, icon: FileEdit, perm: "site-content" },
    { href: "/site-content/qr", label: lang === 'mn' ? "QR Портал" : "QR Portal", icon: LayoutDashboard, perm: "site-content" },
    { href: "/chat", label: t.nav.chat, icon: MessageCircle, perm: "chat" },
    { href: "/users", label: t.nav.users, icon: Users, perm: "admin-users" },
  ];

  const titles: Record<string, string> = {
    "/dashboard": t.nav.dashboard,
    "/site-content": t.nav.siteContent,
    "/chat": t.nav.chat,
    "/users": t.nav.users,
  };

  const SITES = [
    { id: "zevtabs", label: "Zevtabs" },
    { id: "parkease", label: "Parkease" },
    { id: "posease", label: "Posease" },
    { id: "amarhome", label: "Amarhome" },
    { id: "rently", label: "Rently" },
  ];

  const title = titles[pathname] ?? "Zevtabs Admin";
  const [navOpen, setNavOpen] = useState(false);
  const [perms, setPerms] = useState<string[]>([]);
  const [who, setWho] = useState<string>("");

  useEffect(() => {
    const prof = readClientAdminProfile();
    if (prof?.permissions?.length) {
      setPerms(prof.permissions);
      setWho(prof.displayName || prof.username);
      return;
    }
    if (readClientAdminToken()) {
      setPerms(["*"]);
      setWho(lang === "mn" ? "Админ" : "Admin");
    }
  }, []);

  const visibleNav = navItems.filter((item) => adminClientHasPermission(perms, item.perm));

  async function logout() {
    try {
      await fetch(`${ADMIN_BASE_PATH}/api/auth/logout`, { method: "POST" });
    } finally {
      clearClientAdminToken();
      router.replace("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <div className="flex min-h-dvh flex-1 overflow-x-hidden bg-zinc-50 dark:bg-zinc-900">
      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          aria-label={t.common.cancel}
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,92vw)] shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-auto lg:w-56 lg:translate-x-0 ${
          navOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative flex min-h-17 items-center justify-center border-b border-zinc-200 px-12 py-3 dark:border-zinc-800 lg:px-3">
          <Link
            href="/dashboard"
            className="flex max-w-full items-center justify-center gap-2.5 rounded-md px-2 py-1 outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-600"
            onClick={() => setNavOpen(false)}
          >
            <img src={`${ADMIN_BASE_PATH}/logo.png`} alt="Zevtabs" className="w-8 h-8 object-contain shrink-0" />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Zevtabs Admin</span>
          </Link>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 shrink-0 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label={t.common.cancel}
            onClick={() => setNavOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {visibleNav.map(({ href, label, icon: Icon }) => {
              const fullHref = `/${siteId}${href}`;
              const active = pathname === fullHref || pathname === href;
              return (
                <Link
                  key={href}
                  href={fullHref}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                }`}
                onClick={() => setNavOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 sm:gap-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label={t.nav.openMenu || "Open menu"}
            onClick={() => setNavOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 flex items-center gap-4">
            <div>
              <h1 className="truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-50">
                {title}
              </h1>
              {who ? (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{who}</p>
              ) : null}
            </div>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/30 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {SITES.find(s => s.id === siteId)?.label || "Select Project"}
                </span>
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[60] overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
                {SITES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const base = pathname.replace(/^\/[^/]+/, "");
                      router.push(`/${s.id}${base || "/dashboard"}`);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      siteId === s.id 
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold" 
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${siteId === s.id ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 uppercase"
          >
            {lang === "mn" ? "EN" : "MN"}
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void logout()}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t.header.logout}</span>
          </button>
        </header>
        <main className="flex min-h-0 flex-1 overflow-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
