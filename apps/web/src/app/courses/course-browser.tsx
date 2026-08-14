"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { courseCatalog, courseCategories } from "@/lib/course-catalog";

const coursePriceInInr = 699;

export function CourseBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof courseCategories)[number]>("All");

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courseCatalog.filter((course) => {
      const matchesCategory =
        category === "All" || course.category === category;

      const searchable = [
        course.title,
        course.category,
        course.summary,
        ...course.outcomes,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <label className="field flex h-14 items-center gap-3 rounded-xl bg-slate-50 px-4 transition focus-within:bg-white">
          <Search
            className="shrink-0 text-[var(--brand)]"
            size={21}
            aria-hidden="true"
          />

          <span className="sr-only">Search courses</span>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Python, DevOps, Java..."
            className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <div
          className="mt-5 flex flex-wrap items-center gap-2"
          aria-label="Course categories"
        >
          <span className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filter
          </span>

          {courseCategories.map((item) => {
            const selected = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`h-10 rounded-xl border px-4 text-sm font-bold transition-all duration-150 ${
                  selected
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
                aria-pressed={selected}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((course) => {
          return (
            <article
              key={course.slug}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_7px_26px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(37,99,235,0.10)]"
            >
              

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-rose-300 bg-white p-2 shadow-sm">
  <img
    src={course.image}
    alt={course.title}
    width={110}
    height={110}
    className="h-24 w-24 object-contain"
  />
</div>

                  <span className="mt-4 rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                    {course.category}
                  </span>

                  <h2 className="mt-3 text-lg font-extrabold leading-6 tracking-tight text-slate-900">
                    {course.title}
                  </h2>
                </div>

                <p className="mt-4 min-h-[76px] text-sm leading-6 text-slate-500">
                  {course.summary}
                </p>

                <div className="mt-5 grid gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClock size={16} aria-hidden="true" />
                    <span>{course.schedule}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <IndianRupee size={16} aria-hidden="true" />
                    <span>Target price INR {coursePriceInInr}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <UsersRound size={16} aria-hidden="true" />
                    <span>Live instructor support</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-start gap-2 text-sm leading-5 text-slate-600"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-blue-600"
                        size={16}
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={`/courses/${course.slug}`}
                  className="ink-button mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold"
                >
                  View course
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {visibleCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-black text-[var(--ink)]">
            No courses found
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Try another search term or choose a different category.
          </p>
        </div>
      ) : null}
    </section>
  );
}