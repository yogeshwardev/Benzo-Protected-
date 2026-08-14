"use client";

import { getCourseImage } from "@/lib/course-catalog";
import { CalendarCheck, Percent } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  StatusBadge,
} from "@/components/student-ui";
import { formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Attendance = {
  id: string;
  attendedSeconds: number;
  scheduledSeconds: number;
  percent: number;
  state: string;
  calculatedAt: string;
  liveClass: {
    title: string;
    startsAt: string;
    course: {
      title: string;
      slug: string;
    };
  };
};

export default function StudentAttendancePage() {
  const { data, error, loading, reload } =
    useApi<Attendance[]>("/attendance/me");

  if (loading) {
    return <LoadingState label="Loading attendance records" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => void reload()}
      />
    );
  }

  const average = data?.length
    ? Math.round(
        data.reduce((sum, item) => sum + item.percent, 0) / data.length,
      )
    : 0;

  return (
    <>
      <PageHeading
        eyebrow="Learning records"
        title="Attendance"
        description="Attendance is calculated from connected time inside the official class window. Reconnected sessions are combined before classification."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CalendarCheck
            className="text-emerald-600"
            size={24}
          />

          <p className="mt-4 text-2xl font-black">
            {data?.length ?? 0}
          </p>

          <p className="mt-1 text-xs font-bold text-[var(--muted)]">
            Classes summarized
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Percent
            className="text-violet-600"
            size={24}
          />

          <p className="mt-4 text-2xl font-black">
            {average}%
          </p>

          <p className="mt-1 text-xs font-bold text-[var(--muted)]">
            Average attendance
          </p>
        </div>
      </section>

      {!data?.length ? (
        <div className="mt-6">
          <EmptyState
            title="No attendance records yet"
            body="Summaries appear after an instructor or admin completes attendance processing for a live class."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-5 transition hover:bg-slate-50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
                <img
                  src={getCourseImage(item.liveClass.course.slug)}
                  alt={item.liveClass.course.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-[var(--ink)]">
                  {item.liveClass.title}
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {item.liveClass.course.title} ·{" "}
                  {formatDate(item.liveClass.startsAt, true)}
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <p className="text-sm font-black">
                    {Math.round(item.attendedSeconds / 60)} /{" "}
                    {Math.round(item.scheduledSeconds / 60)} min
                  </p>

                  <StatusBadge value={item.state} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}