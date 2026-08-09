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
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiBaseUrl, roleHome, type AuthSession } from "@/lib/auth";
import { clearSession, getSession } from "@/lib/api";

type NavigationItem = [group: string, label: string, href: string, icon: LucideIcon, superOnly?: boolean];

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
  ["SUPER ADMIN", "Admin accounts", "/admin/admins", UserCog, true]
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
  ["ACCOUNT", "Notifications", "/instructor/notifications", Bell]
];

export function RoleShell({ mode, children }: { mode: "admin" | "instructor"; children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = getSession();
    if (!stored) {
      window.location.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const allowed = mode === "admin"
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
        body: JSON.stringify({ refreshToken: session.refreshToken })
      });
    }
    clearSession();
    window.location.assign("/auth/login");
  }

  if (!ready || !session) {
    return <main className="grid min-h-screen place-items-center bg-[var(--background)] text-sm font-bold text-[var(--muted)]">Opening your workspace...</main>;
  }

  const navigation = (mode === "admin" ? adminNavigation : instructorNavigation).filter(
    ([, , , , superOnly]) => !superOnly || session.user.role === "SUPER_ADMIN"
  );
  const accountLabel = session.user.role === "SUPER_ADMIN" ? "Super admin" : mode === "admin" ? "Admin" : "Instructor";

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[272px_1fr]">
      <aside className={`${open ? "fixed inset-0 z-50 flex" : "hidden"} border-r border-black/10 bg-[#111b4f] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col`}>
        <div className="flex h-full w-[300px] flex-col bg-[#111b4f] lg:w-full">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <a className="flex items-center gap-2 text-xl font-black" href={mode === "admin" ? "/admin" : "/instructor"}>
              <span className="grid size-8 place-items-center rounded-lg bg-white text-sm text-[var(--brand)]">B</span>
              BENZO
            </a>
            <button className="grid size-10 place-items-center lg:hidden" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3" aria-label={`${accountLabel} navigation`}>
            {[...new Set(navigation.map(([group]) => group))].map((group) => (
              <div key={group} className="mb-5">
                <p className="px-3 pb-2 text-[11px] font-black text-white/40">{group}</p>
                {navigation.filter(([itemGroup]) => itemGroup === group).map(([, label, href, Icon]) => {
              const active = href === `/${mode}` ? pathname === href : pathname.startsWith(href);
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${active ? "bg-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  style={active ? { color: "#111b4f" } : undefined}
                >
                  <Icon size={17} />
                  {label}
                </a>
              );
            })}
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <p className="truncate text-sm font-black">{session.user.name}</p>
            <p className="truncate text-xs text-white/55">{session.user.email}</p>
            <button className="mt-3 flex h-9 w-full items-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-bold text-white/80" type="button" onClick={() => void logout()}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        <button className="flex-1 bg-black/40 lg:hidden" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 backdrop-blur md:px-7">
          <button className="grid size-10 place-items-center rounded-lg border border-black/10 bg-white lg:hidden" type="button" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="hidden items-center gap-2 text-sm font-black text-[var(--brand)] lg:flex">
            <Settings2 size={17} /> {accountLabel} workspace
          </span>
          <div className="ml-auto text-right">
            <p className="text-sm font-black text-[var(--ink)]">{session.user.name}</p>
            <p className="text-xs text-[var(--muted)]">{accountLabel} account</p>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
