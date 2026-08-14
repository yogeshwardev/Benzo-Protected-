"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  Gauge,
  Gift,
  GraduationCap,
  LogOut,
  Menu,
  MessageCircle,
  ReceiptText,
  WalletCards,
  X,
} from "lucide-react";

import { apiBaseUrl, roleHome, type AuthSession } from "@/lib/auth";
import { clearSession, getSession } from "@/lib/api";

const navigation = [
  ["LEARNING", "Overview", "/student", Gauge],
  ["LEARNING", "My courses", "/student/courses", GraduationCap],
  ["LEARNING", "Assignments", "/student/assignments", ClipboardCheck],
  ["LEARNING", "Quizzes", "/student/quizzes", BookOpenCheck],
  ["LEARNING", "Attendance", "/student/attendance", CalendarCheck],

  ["ACCOUNT", "Course chat", "/student/chat", MessageCircle],
  ["ACCOUNT", "Payments", "/student/payments", CreditCard],
  ["ACCOUNT", "Invoices", "/student/invoices", ReceiptText],
  ["ACCOUNT", "Referrals", "/student/referrals", Gift],
  ["ACCOUNT", "Wallet", "/student/wallet", WalletCards],
  ["ACCOUNT", "Certificates", "/student/certificates", Award],
  ["ACCOUNT", "Notifications", "/student/notifications", Bell],
] as const;

export function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // Desktop sidebar collapse
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = getSession();

    if (!stored) {
      window.location.replace(
        `/auth/login?next=${encodeURIComponent(pathname)}`
      );
      return;
    }

    if (stored.user.role !== "STUDENT") {
      window.location.replace(roleHome(stored.user.role));
      return;
    }

    setSession(stored);
    setReady(true);
  }, [pathname]);

  async function logout() {
    if (session) {
      void fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
        }),
      });
    }

    clearSession();
    window.location.assign("/auth/login");
  }

  if (!ready || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)] text-sm font-bold text-[var(--muted)]">
        Opening your workspace...
      </main>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#f4f7fa] lg:grid ${
        collapsed
          ? "lg:grid-cols-[82px_1fr]"
          : "lg:grid-cols-[270px_1fr]"
      }`}
    >
      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`${
          open ? "fixed inset-0 z-50 flex" : "hidden"
        } lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col`}
      >
        <div
          className={`flex h-full flex-col bg-[#2454C6] ${
            collapsed ? "w-[82px]" : "w-[270px]"
          }`}
        >
          {/* =====================================================
              SIDEBAR HEADER
          ===================================================== */}

          <div
            className={`relative flex h-[76px] shrink-0 items-center border-b border-white/[0.10] ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }`}
          >
            {/* EXISTING BENZO BRAND */}
            <a
  href="/student"
  className={`flex items-center text-white ${
    collapsed ? "justify-center" : "gap-3"
  }`}
>
  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-sm font-black text-[#2457d6] shadow-sm">
    B
  </span>

  {!collapsed ? (
    <span className="text-xl font-black tracking-[-0.035em]">
      BENZO
    </span>
  ) : null}
</a>

            {/* =================================================
                ONE DESKTOP COLLAPSE BUTTON ONLY
            ================================================= */}

            {!collapsed ? (
              <button
                type="button"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                onClick={() => setCollapsed(true)}
                className="hidden size-8 place-items-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white lg:grid"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Expand sidebar"
                title="Expand sidebar"
                onClick={() => setCollapsed(false)}
                className="absolute right-[-14px] top-[24px] z-40 hidden size-8 place-items-center rounded-md border border-white/10 bg-[#3b63df] text-white shadow-md transition hover:bg-[#4b637a] lg:grid"
              >
                <Menu size={17} aria-hidden="true" />
              </button>
            )}

            {/* MOBILE CLOSE */}
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* =====================================================
              NAVIGATION
          ===================================================== */}

          <nav
            className="flex-1 overflow-y-auto py-5"
            aria-label="Student navigation"
          >
            {["LEARNING", "ACCOUNT"].map((section) => (
              <div key={section} className="mb-6">
                {/* SECTION TITLE */}
                {!collapsed ? (
                  <p className="px-7 pb-2 text-[10px] font-bold tracking-[0.14em] text-white/45">
                    {section}
                  </p>
                ) : (
                  <div className="mx-4 mb-2 border-t border-white/[0.10]" />
                )}

                {/* MENU ITEMS */}
                <div>
                  {navigation
                    .filter(([group]) => group === section)
                    .map(([, label, href, Icon]) => {
                      const active =
                        href === "/student"
                          ? pathname === href
                          : pathname.startsWith(href);

                      return (
                        <a
                          key={href}
                          href={href}
                          title={collapsed ? label : undefined}
                          aria-current={
                            active ? "page" : undefined
                          }
                          onClick={() => setOpen(false)}
                          className={`group relative flex h-[48px] items-center border-b border-white/[0.09] transition-all duration-150 ${
                            collapsed
                              ? "justify-center px-2"
                              : "gap-4 px-7"
                          } ${
                            active
                              ? "bg-[#2859d5] text-white"
                              : "text-white/75 hover:bg-[#2859d5] hover:text-white"
                          }`}
                        >
                          {/* ACTIVE LEFT LINE */}
                          {active ? (
                            <span className="absolute left-0 top-0 h-full w-[3px] bg-[#ffffff]" />
                          ) : null}

                          {/* EXISTING ICON */}
                          <Icon
                            size={20}
                            strokeWidth={1.8}
                            className={`shrink-0 ${
                              active
                                ? "text-white"
                                : "text-white/45 group-hover:text-white/80"
                            }`}
                            aria-hidden="true"
                          />

                          {/* LABEL */}
                          {!collapsed ? (
                            <span className="truncate text-[15px] font-medium">
                              {label}
                            </span>
                          ) : null}

                          {/* ACTIVE ARROW */}
                          {!collapsed && active ? (
                            <span className="ml-auto text-lg leading-none text-white/35">
                              ›
                            </span>
                          ) : null}
                        </a>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          {/* =====================================================
              PROFILE / LOGOUT
          ===================================================== */}

          <div className="shrink-0 border-t border-white/[0.16] bg-[#1d4bb5] p-3">
            <div
              className={`rounded-lg bg-white/[0.045] ${
                collapsed ? "p-2" : "p-3"
              }`}
            >
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                }`}
              >
                {/* EXISTING USER INITIAL — NO NEW IMAGE */}
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dbeafe] text-sm font-black text-[#2457d6]">
                  {session.user.name?.charAt(0)?.toUpperCase() || "B"}
                </div>

                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {session.user.name}
                    </p>

                    <p className="truncate text-[11px] text-white/45">
                      {session.user.email}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* LOGOUT */}
              <button
                type="button"
                aria-label="Logout"
                title={collapsed ? "Logout" : undefined}
                onClick={() => void logout()}
                className={`mt-3 flex h-10 items-center rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/65 transition hover:bg-white hover:text-[#304255] ${
                  collapsed
                    ? "mx-auto w-10 justify-center"
                    : "w-full gap-2 px-3"
                }`}
              >
                <LogOut size={16} aria-hidden="true" />

                {!collapsed ? "Logout" : null}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="flex-1 bg-slate-950/45 lg:hidden"
        />
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <div className="min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7">
          {/* MOBILE MENU */}
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* BROWSE COURSES */}
          <a
            href="/courses"
            className="hidden rounded-md bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 lg:inline"
          >
            Browse courses
          </a>

          {/* RIGHT SIDE */}
          <div className="ml-auto flex items-center gap-4">
            {/* NOTIFICATIONS */}
            <a
              href="/student/notifications"
              aria-label="Notifications"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Bell size={18} aria-hidden="true" />
            </a>

            {/* USER */}
            <div className="hidden border-l border-slate-200 pl-4 text-right sm:block">
              <p className="text-sm font-bold text-[var(--ink)]">
                {session.user.name}
              </p>

              <p className="text-xs text-[var(--muted)]">
                Student account
              </p>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="mx-auto max-w-7xl p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}