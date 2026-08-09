import { CalendarCheck, Percent } from "lucide-react";

export default function StudentAttendancePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Attendance</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <CalendarCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Live class presence</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Attendance is calculated from official class windows.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Percent className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Certificate requirement</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Certificate eligibility requires at least 80 percent attendance.
          </p>
        </article>
      </section>
    </main>
  );
}
