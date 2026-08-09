import { MessageSquareWarning, ShieldCheck } from "lucide-react";

export default function AdminChatModerationPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Chat moderation</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <MessageSquareWarning className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Course rooms</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Every chat room is scoped to a course and checked against enrollment or assignment.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Audit log</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Moderation keeps the original record and writes an audit event with the reason.
          </p>
        </article>
      </section>
    </main>
  );
}
