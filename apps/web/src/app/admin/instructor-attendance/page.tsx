import { CalendarCheck, Percent } from "lucide-react";

export default function AdminInstructorAttendancePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Instructor attendance</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <CalendarCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Official duration</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Attendance duration is clipped to the scheduled class window.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Percent className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Salary signal</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Salary generation stores attendance seconds, scheduled seconds, and percentage.
          </p>
        </article>
      </section>
    </main>
  );
}

