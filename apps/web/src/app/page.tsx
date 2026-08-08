import { ArrowRight, CalendarClock, IndianRupee, ShieldCheck, Video } from "lucide-react";
import { BENZO } from "@benzo/shared";

const courses = [
  "C Programming",
  "Python",
  "Java",
  "C++",
  "Web Development Using AI",
  "DevOps",
  "Linux Administration"
];

const workQueues = [
  { label: "Next live class", value: "Python at 7:00 PM" },
  { label: "Assignment reviews", value: "12 pending" },
  { label: "Withdrawal approvals", value: "3 pending" },
  { label: "Payment issues", value: "0 blocking" }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 content-center gap-10 px-5 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
              Instructor-led technology learning
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-[var(--foreground)] md:text-7xl">
              BENZO
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Affordable live courses for beginners who need structure, practice,
              attendance, instructor support, and certificates that can be verified.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/courses"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white"
              >
                Browse courses <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="/auth/register"
                className="inline-flex h-11 items-center rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--foreground)]"
              >
                Create student account
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Today at BENZO</h2>
                <ShieldCheck className="text-[var(--brand)]" aria-hidden="true" />
              </div>
              <div className="grid gap-3">
                {workQueues.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-md border border-[var(--line)] px-4 py-3"
                  >
                    <span className="text-sm text-[var(--muted)]">{item.label}</span>
                    <strong className="text-sm">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--line)] bg-white p-4">
                <Video className="mb-3 text-[var(--brand)]" aria-hidden="true" />
                <p className="text-sm font-semibold">Live classes</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Built around LiveKit.</p>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-white p-4">
                <IndianRupee className="mb-3 text-[var(--accent)]" aria-hidden="true" />
                <p className="text-sm font-semibold">Backend pricing</p>
                <p className="mt-1 text-sm text-[var(--muted)]">No trusted browser totals.</p>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-white p-4">
                <CalendarClock className="mb-3 text-[var(--brand-strong)]" aria-hidden="true" />
                <p className="text-sm font-semibold">Attendance</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Tracked by valid presence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Initial courses</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Prices are database-controlled. Initial target price is INR 699 per course.
            </p>
          </div>
          <span className="hidden text-sm font-medium text-[var(--brand)] sm:inline">
            {BENZO.productionUrl}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <article key={course} className="rounded-lg border border-[var(--line)] bg-white p-4">
              <h3 className="font-semibold">{course}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Live classes, recordings, materials, assignments, quizzes, chat, attendance,
                and certificate eligibility.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

