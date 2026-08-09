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
  X
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
  ["ACCOUNT", "Notifications", "/student/notifications", Bell]
] as const;

export function StudentShell({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={`${open ? "fixed inset-0 z-50 flex" : "hidden"} border-r border-black/10 bg-[#111b4f] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col`}>
        <div className="flex h-full w-[286px] flex-col bg-[#111b4f] lg:w-full">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <a className="flex items-center gap-2 text-xl font-black" href="/student">
              <span className="grid size-8 place-items-center rounded-lg bg-white text-sm text-[var(--brand)]">B</span>
              BENZO
            </a>
            <button className="grid size-10 place-items-center lg:hidden" type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3" aria-label="Student navigation">
            {["LEARNING", "ACCOUNT"].map((section) => (
              <div key={section} className="mb-5">
                <p className="px-3 pb-2 text-[11px] font-black text-white/40">{section}</p>
                {navigation.filter(([group]) => group === section).map(([, label, href, Icon]) => {
              const active = href === "/student" ? pathname === href : pathname.startsWith(href);
              return (
                <a key={href} href={href} onClick={() => setOpen(false)} className={`mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${active ? "bg-white text-[#111b4f]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <Icon size={17} aria-hidden="true" />
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
              <LogOut size={16} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
        <button className="flex-1 bg-black/40 lg:hidden" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 backdrop-blur md:px-7">
          <button className="grid size-10 place-items-center rounded-lg border border-black/10 bg-white lg:hidden" type="button" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu size={20} aria-hidden="true" />
          </button>
          <a className="hidden text-sm font-black text-[var(--brand)] lg:inline" href="/courses">Browse courses</a>
          <div className="ml-auto flex items-center gap-3">
            <a className="grid size-10 place-items-center rounded-lg border border-black/10 bg-white" href="/student/notifications" aria-label="Notifications">
              <Bell size={18} aria-hidden="true" />
            </a>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[var(--ink)]">{session.user.name}</p>
              <p className="text-xs text-[var(--muted)]">Student account</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
