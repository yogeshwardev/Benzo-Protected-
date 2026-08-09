import { Bell, CheckCircle2 } from "lucide-react";

export default function StudentNotificationsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Bell className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Announcements</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Course, student, and platform announcements appear in the personal inbox.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <CheckCircle2 className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Read state</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Each notification can be marked read without changing the original announcement.
          </p>
        </article>
      </section>
    </main>
  );
}
