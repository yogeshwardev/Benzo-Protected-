"use client";

import { CalendarCheck, Percent } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Attendance = { id: string; attendedSeconds: number; scheduledSeconds: number; percent: number; state: string; calculatedAt: string; liveClass: { title: string; startsAt: string; course: { title: string } } };

export default function StudentAttendancePage() {
  const { data, error, loading, reload } = useApi<Attendance[]>("/attendance/me");
  if (loading) return <LoadingState label="Loading attendance records" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  const average = data?.length ? Math.round(data.reduce((sum, item) => sum + item.percent, 0) / data.length) : 0;
  return <><PageHeading eyebrow="Learning records" title="Attendance" description="Attendance is calculated from connected time inside the official class window. Reconnected sessions are combined before classification." />
    <section className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2"><div className="bg-white p-5"><CalendarCheck className="text-[var(--brand)]" size={22}/><p className="mt-4 text-2xl font-black">{data?.length ?? 0}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">Classes summarized</p></div><div className="bg-white p-5"><Percent className="text-[var(--brand)]" size={22}/><p className="mt-4 text-2xl font-black">{average}%</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">Average attendance</p></div></section>
    {!data?.length ? <div className="mt-6"><EmptyState title="No attendance records yet" body="Summaries appear after an instructor or admin completes attendance processing for a live class." /></div> : <div className="mt-6 divide-y divide-[var(--line)] border border-[var(--line)] bg-white">{data.map((item) => <div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-black text-[var(--ink)]">{item.liveClass.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.liveClass.course.title} · {formatDate(item.liveClass.startsAt, true)}</p></div><p className="text-sm font-black">{Math.round(item.attendedSeconds/60)} / {Math.round(item.scheduledSeconds/60)} min</p><StatusBadge value={item.state}/></div>)}</div>}
  </>;
}
