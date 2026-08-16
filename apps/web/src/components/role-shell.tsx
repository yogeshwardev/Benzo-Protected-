"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FileText,
  Gauge,
  GraduationCap,
  IndianRupee,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  Megaphone,
  PlaySquare,
  ReceiptText,
  Settings2,
  ShieldCheck,
  TicketPercent,
  UserCog,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { apiBaseUrl, roleHome, type AuthSession } from "@/lib/auth";
import { clearSession, getSession } from "@/lib/api";

type NavigationItem = [
  group: string,
  label: string,
  href: string,
  icon: LucideIcon,
  superOnly?: boolean,
];

const adminNavigation: NavigationItem[] = [
  ["OVERVIEW", "Dashboard", "/admin", Gauge],

  ["ACADEMICS", "Students", "/admin/students", GraduationCap],
  ["ACADEMICS", "Instructors", "/admin/instructors", UsersRound],
  ["ACADEMICS", "Courses", "/admin/courses", BookOpenCheck],
  ["ACADEMICS", "Enrollments", "/admin/academics", ClipboardCheck],
  ["ACADEMICS", "Learning", "/admin/learning", FileText],
  ["ACADEMICS", "Live classes", "/admin/live-classes", CalendarClock],
  ["ACADEMICS", "Attendance", "/admin/instructor-attendance", CalendarCheck],

  ["FINANCE", "Payments", "/admin/payments", CreditCard],
  ["FINANCE", "Financial", "/admin/financial", ReceiptText],
  ["FINANCE", "Coupons", "/admin/coupons", TicketPercent],
  ["FINANCE", "Referrals", "/admin/referrals", WalletCards],
  ["FINANCE", "Withdrawals", "/admin/withdrawals", IndianRupee],
  ["FINANCE", "Salary", "/admin/salaries", IndianRupee],

  ["PLATFORM", "Certificates", "/admin/certificates", Award],
  ["PLATFORM", "Chat", "/admin/chat", MessageCircle],
  ["PLATFORM", "Announcements", "/admin/announcements", Megaphone],
  ["PLATFORM", "Audit logs", "/admin/audit-logs", ShieldCheck],

  ["SUPER ADMIN", "Admin accounts", "/admin/admins", UserCog, true],
];

const instructorNavigation: NavigationItem[] = [
  ["TEACHING", "Dashboard", "/instructor", Gauge],
  ["TEACHING", "Students", "/instructor/students", UsersRound],
  ["TEACHING", "Live classes", "/instructor/classes", CalendarClock],
  ["TEACHING", "Attendance", "/instructor/attendance", CalendarCheck],
  ["TEACHING", "Lessons", "/instructor/lessons", BookOpenCheck],
  ["TEACHING", "Materials", "/instructor/materials", FileText],
  ["TEACHING", "Assignments", "/instructor/assignments", ClipboardCheck],
  ["TEACHING", "Quizzes", "/instructor/quizzes", ListChecks],
  ["TEACHING", "Recordings", "/instructor/recordings", PlaySquare],

  ["COMMUNICATION", "Course chat", "/instructor/chat", MessageCircle],
  ["COMMUNICATION", "Announcements", "/instructor/announcements", Megaphone],

  ["ACCOUNT", "Salary", "/instructor/salary", IndianRupee],
  ["ACCOUNT", "Notifications", "/instructor/notifications", Bell],
];

export function RoleShell({
  mode,
  children,
}: {
  mode: "admin" | "instructor";
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  // Same collapse behavior as student sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Mobile sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = getSession();

    if (!stored) {
      window.location.replace(
        `/auth/login?next=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    const allowed =
      mode === "admin"
        ? stored.user.role === "ADMIN" ||
        stored.user.role === "SUPER_ADMIN"
        : stored.user.role === "INSTRUCTOR";

    if (!allowed) {
      window.location.replace(roleHome(stored.user.role));
      return;
    }

    setSession(stored);
    setReady(true);
  }, [mode, pathname]);

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

  const navigation = (
    mode === "admin" ? adminNavigation : instructorNavigation
  ).filter(
    ([, , , , superOnly]) =>
      !superOnly || session.user.role === "SUPER_ADMIN",
  );

  const groups = [...new Set(navigation.map(([group]) => group))];

  const accountLabel =
    session.user.role === "SUPER_ADMIN"
      ? "Super admin"
      : mode === "admin"
        ? "Admin"
        : "Instructor";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          bg-[#2b59c9] text-white
          shadow-[4px_0_20px_rgba(15,23,42,0.08)]
          transition-all duration-300

          ${collapsed ? "w-[76px]" : "w-[274px]"}

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* LOGO HEADER */}
        <div
          className={`
            flex h-[76px] shrink-0 items-center
            border-b border-white/10
            ${collapsed ? "justify-center px-3" : "justify-between px-5"}
          `}
        >
          <a
            href={mode === "admin" ? "/admin" : "/instructor"}
            className="flex items-center gap-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-black text-[#2b59c9] shadow-sm">
              B
            </span>

            {!collapsed && (
              <span className="text-xl font-black tracking-tight text-white">
                BENZO
              </span>
            )}
          </a>

          {/* DESKTOP COLLAPSE */}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            className={`
              hidden size-9 place-items-center rounded-lg
              text-white/60 transition
              hover:bg-white/10 hover:text-white
              lg:grid
              ${collapsed ? "absolute right-1/2 translate-x-1/2" : ""}
            `}
          >
            {collapsed ? (
              <Menu size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden"
          aria-label={`${accountLabel} navigation`}
        >
          <div className="py-4">
            {groups.map((group) => (
              <div key={group} className="mb-5">
                {/* GROUP TITLE */}
                {!collapsed && (
                  <div className="px-7 pb-2 pt-1">
                    <p className="text-[10px] font-extrabold tracking-[0.16em] text-white/45">
                      {group}
                    </p>
                  </div>
                )}

                {/* ITEMS */}
                <div>
                  {navigation
                    .filter(([itemGroup]) => itemGroup === group)
                    .map(([, label, href, Icon]) => {
                      const active =
                        href === `/${mode}`
                          ? pathname === href
                          : pathname.startsWith(href);

                      return (
                        <a
                          key={href}
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          title={collapsed ? label : undefined}
                          className={`
                            group relative flex h-12 items-center
                            border-b border-white/10
                            text-sm font-bold
                            transition-all duration-200

                            ${collapsed
                              ? "justify-center px-0"
                              : "gap-4 px-7"
                            }

                            ${active
                              ? "bg-white/10 text-white"
                              : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                            }
                          `}
                        >
                          {/* ACTIVE INDICATOR */}
                          {active && (
                            <span className="absolute left-0 top-0 h-full w-[3px] bg-white" />
                          )}

                          <Icon
                            size={19}
                            strokeWidth={active ? 2.2 : 1.8}
                            className="shrink-0"
                          />

                          {!collapsed && (
                            <>
                              <span className="truncate">{label}</span>

                              {href === `/${mode}` && (
                                <span className="ml-auto text-white/50">
                                  ›
                                </span>
                              )}
                            </>
                          )}
                        </a>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ACCOUNT / PROFILE */}
        <div className="shrink-0 border-t border-white/15 p-3">
          <div
            className={`
              rounded-xl bg-white/[0.08]
              ${collapsed ? "p-2" : "p-3"}
            `}
          >
            <div
              className={`
                flex items-center
                ${collapsed ? "justify-center" : "gap-3"}
              `}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-[#2b59c9]">
                B
              </span>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {session.user.name}
                  </p>

                  <p className="truncate text-xs text-white/45">
                    {session.user.email}
                  </p>
                </div>
              )}
            </div>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={() => void logout()}
              title={collapsed ? "Logout" : undefined}
              className={`
                mt-3 flex h-10 w-full items-center
                rounded-lg border border-white/10
                text-sm font-bold text-white/65
                transition
                hover:bg-white/10 hover:text-white

                ${collapsed ? "justify-center" : "gap-2 px-3"}
              `}
            >
              <LogOut size={17} />

              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:pl-[76px]" : "lg:pl-[274px]"}
        `}
      >
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          {/* MOBILE MENU */}
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* WORKSPACE LABEL */}
          <span className="ml-3 hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-700 lg:flex">
            <Settings2 size={16} />
            {accountLabel} workspace
          </span>

          {/* USER */}
          <div className="ml-auto text-right">
            <p className="text-sm font-black text-[var(--ink)]">
              {session.user.name}
            </p>

            <p className="text-xs text-[var(--muted)]">
              {accountLabel} account
            </p>
          </div>
        </header>

        {/* PAGE */}
        <main className="mx-auto max-w-[1500px] p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}