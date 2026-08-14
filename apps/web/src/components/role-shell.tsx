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
  const [open, setOpen] = useState(false);

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
        ? stored.user.role === "ADMIN" || stored.user.role === "SUPER_ADMIN"
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
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

  const accountLabel =
    session.user.role === "SUPER_ADMIN"
      ? "Super admin"
      : mode === "admin"
        ? "Admin"
        : "Instructor";

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[272px_1fr]">
      <aside
        className={`${open ? "fixed inset-0 z-50 flex" : "hidden"} border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col`}
      >
        <div className="flex h-full w-[300px] flex-col bg-white lg:w-full">
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
            <a
              className="flex items-center gap-2.5 text-xl font-black tracking-tight text-slate-900"
              href={mode === "admin" ? "/admin" : "/instructor"}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
                B
              </span>
              BENZO
            </a>

            <button
              className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-50 lg:hidden"
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto p-4"
            aria-label={`${accountLabel} navigation`}
          >
            {[...new Set(navigation.map(([group]) => group))].map((group) => (
              <div key={group} className="mb-6">
                <p className="px-3 pb-2 text-[10px] font-extrabold tracking-[0.12em] text-slate-400">
                  {group}
                </p>

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
                        onClick={() => setOpen(false)}
                        className={`mb-1 flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={17} />
                        {label}
                      </a>
                    );
                  })}
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <p className="truncate text-sm font-black text-slate-900">
              {session.user.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              {session.user.email}
            </p>

            <button
              className="mt-3 flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              type="button"
              onClick={() => void logout()}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <button
          className="flex-1 bg-slate-900/30 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <button
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          <span className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-700 lg:flex">
            <Settings2 size={16} />
            {accountLabel} workspace
          </span>

          <div className="ml-auto text-right">
            <p className="text-sm font-black text-[var(--ink)]">
              {session.user.name}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {accountLabel} account
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}