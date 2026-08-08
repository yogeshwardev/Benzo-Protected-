import { CalendarClock, GraduationCap } from "lucide-react";

export default function StudentCoursesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">My courses</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enrolled courses will appear here after a successful paid order creates enrollment.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {["Live access", "Course progress"].map((item) => (
          <article key={item} className="rounded-lg border border-[var(--line)] bg-white p-5">
            {item === "Live access" ? (
              <CalendarClock className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : (
              <GraduationCap className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            )}
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Backend enrollment APIs are scoped to the authenticated student.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

