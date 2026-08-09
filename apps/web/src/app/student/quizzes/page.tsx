import { ListChecks, Trophy } from "lucide-react";

export default function StudentQuizzesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Quizzes</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ListChecks className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">MCQ attempts</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The student submits answer indexes and the backend grades the attempt.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Trophy className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Results</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Quiz scores are tied to the student's active enrollment.
          </p>
        </article>
      </section>
    </main>
  );
}

