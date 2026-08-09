import { CalendarClock, RadioTower, UsersRound } from "lucide-react";

const areas = [
  ["Schedule", "Create and monitor LiveKit-backed live classes."],
  ["Access", "Backend tokens enforce enrollment and instructor assignment."],
  ["Attendance", "Summaries use official class time, not early waiting."]
];

export default function AdminLiveClassesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Live classes</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {areas.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            {title === "Schedule" ? (
              <CalendarClock className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : title === "Access" ? (
              <RadioTower className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : (
              <UsersRound className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            )}
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

