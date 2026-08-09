import { ClipboardCheck, RotateCcw } from "lucide-react";

export default function InstructorAssignmentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Assignments</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ClipboardCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Submission review</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Review student links and record feedback for the assigned course.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <RotateCcw className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Resubmissions</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Students can resubmit when a review asks for changes.
          </p>
        </article>
      </section>
    </main>
  );
}

