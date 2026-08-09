import { CalendarCheck, Clock3 } from "lucide-react";

export default function InstructorAttendancePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Attendance</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Clock3 className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Official class time</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Early waiting time is not credited as teaching attendance.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <CalendarCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Summaries</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Attendance summaries feed salary calculation and admin review.
          </p>
        </article>
      </section>
    </main>
  );
}

