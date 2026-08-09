import { MessageCircle, UsersRound } from "lucide-react";

export default function InstructorChatPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Course chat</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <MessageCircle className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Assigned course rooms</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Instructors can read and reply only inside assigned course rooms.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <UsersRound className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Student support</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Course chat keeps learner questions connected to the course context.
          </p>
        </article>
      </section>
    </main>
  );
}
