import { ClipboardCheck, Upload } from "lucide-react";

export default function StudentAssignmentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Assignments</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ClipboardCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Pending work</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Assignments are visible only for enrolled courses.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Upload className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Submit link</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Submissions store document links and instructor feedback.
          </p>
        </article>
      </section>
    </main>
  );
}

