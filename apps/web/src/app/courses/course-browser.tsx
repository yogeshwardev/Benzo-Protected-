"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, IndianRupee, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { courseCatalog, courseCategories } from "@/lib/course-catalog";

const coursePriceInInr = 699;

export function CourseBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof courseCategories)[number]>("All");

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courseCatalog.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      const searchable = [course.title, course.category, course.summary, ...course.outcomes]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="space-y-7">
      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <label className="field flex h-14 items-center gap-3 rounded-md px-4 transition">
          <Search className="shrink-0 text-[var(--brand)]" size={21} aria-hidden="true" />
          <span className="sr-only">Search courses</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Python, DevOps, Java..."
            className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Course categories">
          <span className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-xs font-black uppercase text-slate-700">
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
                className={`h-10 rounded-md border px-4 text-sm font-bold transition ${
                  selected
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "border-black/10 bg-white text-slate-700 hover:border-[var(--brand)]"
                }`}
                aria-pressed={selected}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((course) => {
          const Icon = course.Icon;

          return (
            <article key={course.slug} className="soft-ring overflow-hidden rounded-lg border border-black/10 bg-white">
              <div className={`h-1.5 bg-gradient-to-r ${course.accent}`} />
              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-[var(--ink)] text-white">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {course.category}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[var(--ink)]">{course.title}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-[var(--muted)]">{course.summary}</p>

                <div className="mt-5 grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <CalendarClock size={16} aria-hidden="true" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <IndianRupee size={16} aria-hidden="true" />
                    <span>Target price INR {coursePriceInInr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <UsersRound size={16} aria-hidden="true" />
                    <span>Live instructor support</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {course.outcomes.map((outcome) => (
                    <div key={outcome} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--brand)]" size={16} aria-hidden="true" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={`/courses/${course.slug}`}
                  className="ink-button mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-black"
                >
                  View course <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {visibleCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/20 bg-white p-8 text-center">
          <h2 className="text-xl font-black text-[var(--ink)]">No courses found</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Try another search term or choose a different category.</p>
        </div>
      ) : null}
    </section>
  );
}
