import { Megaphone, UsersRound } from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Announcements</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Megaphone className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Audience targeting</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Announcements can target everyone, students, instructors, or one course.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <UsersRound className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Notification fan-out</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Published announcements create personal notification rows for eligible recipients.
          </p>
        </article>
      </section>
    </main>
  );
}
