"use client";

import { ArrowRight, CalendarClock, GraduationCap } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "@/components/student-ui";
import { formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    shortDesc: string;
    thumbnail?: string | null;
    schedules: { dayOfWeek: number; startMinute: number; endMinute: number; timezone: string }[];
  };
};

export default function StudentCoursesPage() {
  const { data, error, loading, reload } = useApi<Enrollment[]>("/enrollments/me");
  if (loading) return <LoadingState label="Loading your enrolled courses" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;

  return (
    <>
      <PageHeading eyebrow="Learning" title="My courses" description="Every paid enrollment gives lifetime access to lessons, recordings, activities, and course chat." />
      {!data?.length ? <EmptyState title="No courses yet" body="Complete checkout for any published course and it will appear here immediately." action={<a className="brand-button inline-flex h-11 items-center gap-2 px-5 text-sm font-black" href="/courses">Browse courses <ArrowRight size={17} /></a>} /> : (
        <section className="grid gap-5 lg:grid-cols-2">
          {data.map((enrollment) => (
            <article key={enrollment.id} className="overflow-hidden border border-[var(--line)] bg-white">
              <div className="h-2 bg-[var(--brand)]" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4"><GraduationCap className="text-[var(--brand)]" size={26} /><span className="text-xs font-bold text-[var(--muted)]">Enrolled {formatDate(enrollment.enrolledAt)}</span></div>
                <h2 className="mt-5 text-xl font-black text-[var(--ink)]">{enrollment.course.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{enrollment.course.shortDesc}</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700"><CalendarClock size={17} className="text-[var(--brand)]" /> {scheduleLabel(enrollment.course.schedules)}</p>
                <a className="brand-button mt-5 inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-sm font-black" href={`/student/courses/${enrollment.course.slug}/learn`}>Open course <ArrowRight size={17} /></a>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function scheduleLabel(schedules: Enrollment["course"]["schedules"]) {
  if (!schedules.length) return "Schedule will be announced";
  const item = schedules[0];
  if (!item) return "Schedule will be announced";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const time = (minute: number) => new Date(2020, 0, 1, Math.floor(minute / 60), minute % 60).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return `${days[item.dayOfWeek]} · ${time(item.startMinute)}–${time(item.endMinute)}`;
}
