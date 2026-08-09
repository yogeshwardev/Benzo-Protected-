import { MessageCircle, ShieldCheck } from "lucide-react";

export default function StudentChatPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Course chat</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <MessageCircle className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Enrolled course rooms</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Chat access is scoped to active enrollments.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Moderation</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Removed messages are retained as moderated records for admin review.
          </p>
        </article>
      </section>
    </main>
  );
}
