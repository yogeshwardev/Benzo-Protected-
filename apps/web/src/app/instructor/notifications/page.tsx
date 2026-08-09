import { Bell, Megaphone } from "lucide-react";

export default function InstructorNotificationsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Bell className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Inbox</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Instructor notifications include course announcements and operational updates.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Megaphone className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Announcements</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Published announcements are listed separately from personal read state.
          </p>
        </article>
      </section>
    </main>
  );
}
