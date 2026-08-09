"use client";

import { ArrowRight, BookOpenCheck, CalendarClock, CreditCard, WalletCards } from "lucide-react";
import { ErrorState, LoadingState, MetricCard, PageHeading, SectionCard, StatusBadge } from "@/components/student-ui";
import { formatDate, formatMoney } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = { id: string; course: { title: string; slug: string } };
type Order = { id: string; status: string; finalAmountInPaise: number; createdAt: string; course: { title: string } };
type Wallet = { availableInPaise: number; balanceInPaise: number };
type LiveClass = { id: string; title: string; startsAt: string; course: { title: string } };

export default function StudentDashboardPage() {
  const enrollments = useApi<Enrollment[]>("/enrollments/me");
  const orders = useApi<Order[]>("/orders/me");
  const wallet = useApi<Wallet>("/wallet/me");
  const classes = useApi<LiveClass[]>("/live-classes/me/upcoming");
  const loading = enrollments.loading || orders.loading || wallet.loading || classes.loading;
  const error = enrollments.error || orders.error || wallet.error || classes.error;

  if (loading) return <LoadingState label="Preparing your dashboard" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const latestOrder = orders.data?.[0];
  const nextClass = classes.data?.[0];

  return (
    <>
      <PageHeading
        eyebrow="Student workspace"
        title="Ready to continue learning?"
        description="Your next class, active courses, payments, and referral wallet stay connected here."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<BookOpenCheck size={21} />} label="Active courses" value={String(enrollments.data?.length ?? 0)} href="/student/courses" />
        <MetricCard icon={<CalendarClock size={21} />} label="Upcoming classes" value={String(classes.data?.length ?? 0)} href="/student/courses" />
        <MetricCard icon={<WalletCards size={21} />} label="Available wallet" value={formatMoney(wallet.data?.availableInPaise ?? 0)} href="/student/wallet" />
        <MetricCard icon={<CreditCard size={21} />} label="Successful orders" value={String(orders.data?.filter((order) => order.status === "PAID").length ?? 0)} href="/student/payments" />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="Continue learning" action={<a className="flex items-center gap-1 text-sm font-black text-[var(--brand)]" href="/student/courses">View all <ArrowRight size={15} /></a>}>
          {(enrollments.data?.length ?? 0) > 0 ? (
            <div className="divide-y divide-[var(--line)]">
              {enrollments.data?.slice(0, 4).map((enrollment) => (
                <a key={enrollment.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#f7f9ff]" href={`/student/courses/${enrollment.course.slug}/learn`}>
                  <div>
                    <p className="font-black text-[var(--ink)]">{enrollment.course.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Lifetime course access</p>
                  </div>
                  <ArrowRight className="text-[var(--brand)]" size={18} />
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-[var(--muted)]">
              No active enrollment yet. <a className="font-black text-[var(--brand)]" href="/courses">Browse courses</a> to get started.
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6">
          <div className="app-card p-5">
            <p className="text-xs font-black uppercase text-[var(--muted)]">Next live class</p>
            {nextClass ? (
              <>
                <h2 className="mt-3 font-black text-[var(--ink)]">{nextClass.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{nextClass.course.title}</p>
                <p className="mt-4 text-sm font-bold text-[var(--brand)]">{formatDate(nextClass.startsAt, true)}</p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">No upcoming class is scheduled for your enrolled courses.</p>
            )}
          </div>
          <div className="app-card p-5">
            <p className="text-xs font-black uppercase text-[var(--muted)]">Latest payment</p>
            {latestOrder ? (
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-[var(--ink)]">{latestOrder.course.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{formatMoney(latestOrder.finalAmountInPaise)} / {formatDate(latestOrder.createdAt)}</p>
                </div>
                <StatusBadge value={latestOrder.status} />
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">No payment activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
