import { ClipboardCheck, ListChecks } from "lucide-react";

export default function AdminAcademicsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Academics</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ClipboardCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Assignments</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Create assignments and review submissions with approve, reject, or resubmission states.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ListChecks className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Quizzes</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            MCQ quizzes are graded by the backend using stored correct options.
          </p>
        </article>
      </section>
    </main>
  );
}

