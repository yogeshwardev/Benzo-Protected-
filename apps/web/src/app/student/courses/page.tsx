"use client";

import { ArrowRight, CalendarClock } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from "@/components/student-ui";
import { formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { courseCatalog } from "@/lib/course-catalog";

type Enrollment = {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    shortDesc: string;
    thumbnail?: string | null;
    schedules: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      timezone: string;
    }[];
  };
};

export default function StudentCoursesPage() {
  const { data, error, loading, reload } =
    useApi<Enrollment[]>("/enrollments/me");

  if (loading) {
    return <LoadingState label="Loading your enrolled courses" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void reload()} />;
  }

  return (
    <>
      <PageHeading
        eyebrow="Learning"
        title="My courses"
        description="Every paid enrollment gives lifetime access to lessons, recordings, activities, and course chat."
      />

      {!data?.length ? (
        <EmptyState
          title="No courses yet"
          body="Complete checkout for any published course and it will appear here immediately."
          action={
            <a
              className="brand-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-black"
              href="/courses"
            >
              Browse courses
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          }
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {data.map((enrollment) => {
            const catalogCourse = courseCatalog.find(
              (course) => course.slug === enrollment.course.slug,
            );

            const courseImage =
  catalogCourse?.image ||
  enrollment.course.thumbnail ||
  "/images/python.png";
            return (
              <article
                key={enrollment.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_7px_26px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(37,99,235,0.10)]"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2.5 transition-transform duration-200 group-hover:scale-[1.03]">
                      <img
                        src={courseImage}
                        alt={enrollment.course.title}
                        className="h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.src = "/images/python.png";
                        }}
                      />
                    </div>

                    <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                      Enrolled {formatDate(enrollment.enrolledAt)}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
                    {enrollment.course.title}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {enrollment.course.shortDesc}
                  </p>

                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <CalendarClock
                        size={17}
                        className="text-blue-600"
                        aria-hidden="true"
                      />
                      {scheduleLabel(enrollment.course.schedules)}
                    </p>
                  </div>

                  <a
                    className="brand-button mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-black"
                    href={`/student/courses/${enrollment.course.slug}/learn`}
                  >
                    Open course
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

function scheduleLabel(
  schedules: Enrollment["course"]["schedules"],
) {
  if (!schedules.length) {
    return "Schedule will be announced";
  }

  const item = schedules[0];

  if (!item) {
    return "Schedule will be announced";
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const time = (minute: number) =>
    new Date(
      2020,
      0,
      1,
      Math.floor(minute / 60),
      minute % 60,
    ).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

  return `${days[item.dayOfWeek]} · ${time(item.startMinute)}–${time(item.endMinute)}`;
}