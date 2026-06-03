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
  QrCode,
  ChevronDown,
  Building2,
  Bell,
  MessageSquare,
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
import { getSocketBaseUrl } from "@/lib/api";
import { io } from "socket.io-client";

type NotificationItem = {
  id: string;
  conversationId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
};

function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;
    
    // Tone 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);
    
    // Tone 2 (harmony)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1174.66, now); // D6
    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.4);
  } catch (err) {
    console.warn("Failed to play notification sound:", err);
  }
}

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`zev_noti_${siteId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
            setUnreadCount(parsed.filter((n: any) => !n.read).length);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (e) {
        console.warn("Failed to load notifications from localStorage:", e);
      }
    }
  }, [siteId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`zev_noti_${siteId}`, JSON.stringify(notifications));
      } catch (e) {
        console.warn("Failed to save notifications to localStorage:", e);
      }
    }
  }, [notifications, siteId]);

  useEffect(() => {
    const baseUrl = getSocketBaseUrl();
    const isRelative = !baseUrl || baseUrl.startsWith("/");
    const socketUrl = isRelative ? window.location.origin : baseUrl;
    const socketOptions: any = {
      transports: ["websocket", "polling"],
      withCredentials: true,
    };
    if (isRelative) {
      socketOptions.path = baseUrl ? `${baseUrl}/socket.io` : "/socket.io";
    }

    console.log(`[Admin Shell Socket] Initializing connection to ${socketUrl}`);
    const s = io(socketUrl, socketOptions);

    s.on("connect", () => {
      console.log(`[Admin Shell Socket] Connected. Joining admin room.`);
      s.emit("join-admin");
    });

    s.on("admin:new-user-message", (payload: { conversationId: string; message: { id: string; text: string; postedByDisplayName?: string; createdAt?: string } }) => {
      console.log("[Admin Shell Socket] Received global admin message:", payload);

      const newNoti: NotificationItem = {
        id: payload.message.id || `noti-${Date.now()}`,
        conversationId: payload.conversationId,
        senderName: payload.message.postedByDisplayName || (lang === "mn" ? "Хэрэглэгч" : "User"),
        text: payload.message.text,
        createdAt: payload.message.createdAt || new Date().toISOString(),
        read: false,
      };

      playNotificationSound();

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNoti.id)) return prev;
        const next = [newNoti, ...prev].slice(0, 50);
        setUnreadCount(next.filter((n) => !n.read).length);
        return next;
      });
    });

    return () => {
      console.log("[Admin Shell Socket] Disconnecting");
      s.disconnect();
    };
  }, [siteId, lang]);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setUnreadCount(0);
      return next;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotiClick = (noti: NotificationItem) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n));
      setUnreadCount(next.filter((n) => !n.read).length);
      return next;
    });
    setNotiDropdownOpen(false);
    router.push(`/${siteId}/chat?cId=${noti.conversationId}`);
  };

  const navItems: NavItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, perm: "dashboard" },
    { href: "/site-content", label: t.nav.siteContent, icon: FileEdit, perm: "site-content" },
    { href: "/orders", label: t.nav.orders, icon: ShoppingBag, perm: "orders" },
    { href: "/sales-ads", label: t.nav.salesAds, icon: Megaphone, perm: "sales-ads" },
    { href: "/jobs", label: t.nav.jobs, icon: Briefcase, perm: "jobs" },
    { href: "/chat", label: t.nav.chat, icon: MessageCircle, perm: "chat" },
    { href: "/site-content/qr", label: t.nav.qr, icon: QrCode, perm: "site-content" },
    { href: "/users", label: t.nav.users, icon: Users, perm: "admin-users" },
  ];

  const titles: Record<string, string> = {
    "/dashboard": t.nav.dashboard,
    "/site-content": t.nav.siteContent,
    "/orders": t.nav.orders,
    "/sales-ads": t.nav.salesAds,
    "/jobs": t.nav.jobs,
    "/chat": t.nav.chat,
    "/site-content/qr": t.nav.qr,
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
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
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

            <div className="relative">
              <button
                type="button"
                onClick={() => setSiteMenuOpen(!siteMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{SITES.find((s) => s.id === siteId)?.label || siteId}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${siteMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {siteMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSiteMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-1.5 w-48 origin-top-left overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {lang === "mn" ? "Сайт сонгох" : "Select Site"}
                    </div>
                    {SITES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const nextSite = s.id;
                          const base = pathname.replace(/^\/[^/]+/, "");
                          router.push(`/${nextSite}${base || "/dashboard"}`);
                          setSiteMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                          siteId === s.id
                            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${siteId === s.id ? "bg-emerald-500" : "bg-transparent"}`} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {notiDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotiDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-80 origin-top-right overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                      {lang === "mn" ? "Мэдэгдэл" : "Notifications"}
                    </span>
                    {notifications.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          {lang === "mn" ? "Бүгдийг уншсанд тооцох" : "Mark all read"}
                        </button>
                        <span className="text-zinc-300">|</span>
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="text-[10px] font-bold text-zinc-400 hover:underline"
                        >
                          {lang === "mn" ? "Цэвэрлэх" : "Clear"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                        <span className="mt-2 text-xs text-zinc-400">
                          {lang === "mn" ? "Шинэ мэдэгдэл байхгүй байна" : "No new notifications"}
                        </span>
                      </div>
                    ) : (
                      notifications.map((noti) => (
                        <button
                          key={noti.id}
                          type="button"
                          onClick={() => handleNotiClick(noti)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                            noti.read
                              ? "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              : "bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20"
                          }`}
                        >
                          <div className={`mt-0.5 rounded-full p-1.5 ${
                            noti.read 
                              ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" 
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          }`}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-50">
                                {noti.senderName}
                              </span>
                              <span className="shrink-0 text-[10px] text-zinc-400">
                                {new Date(noti.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                              {noti.text}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
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
