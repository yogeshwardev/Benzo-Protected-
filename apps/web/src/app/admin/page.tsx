import { BadgeIndianRupee, GraduationCap, ShieldCheck, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthStatus } from "@/components/auth-status";
import { RequireSession } from "@/components/require-session";

const items: Array<[LucideIcon, string, string]> = [
  [GraduationCap, "Courses", "Create courses, assign instructors, publish pricing."],
  [UserRoundCheck, "Instructors", "Create instructor accounts and one-course assignments."],
  [BadgeIndianRupee, "Financials", "Orders, discounts, referrals, wallet, and withdrawals."],
  [ShieldCheck, "Governance", "Admin accounts, audit logs, and sensitive settings."]
];

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <RequireSession />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <AuthStatus />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">Operational queues come first.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map(([Icon, title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <Icon className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
