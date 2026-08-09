import { Megaphone, ShieldCheck } from "lucide-react";

export default function InstructorAnnouncementsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Announcements</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Megaphone className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Course updates</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Instructors can publish announcements for assigned courses.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Scoped recipients</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Course announcements reach enrolled students and assigned instructors.
          </p>
        </article>
      </section>
    </main>
  );
}
