import { BookOpenCheck, Plus } from "lucide-react";

export default function InstructorLessonsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Lessons</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Instructors can create lesson content only for their assigned course.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white">
          <Plus size={17} aria-hidden="true" />
          New lesson
        </button>
      </div>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <BookOpenCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="font-semibold">Course outline</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Modules and lessons are ordered by backend position fields and protected by course assignment.
        </p>
      </section>
    </main>
  );
}

