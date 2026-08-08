import { UsersRound } from "lucide-react";

export default function InstructorStudentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Course students</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Instructors can view only students enrolled in their assigned course.
      </p>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <UsersRound className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="font-semibold">Roster access</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The backend validates course assignment before returning enrollment rows.
        </p>
      </section>
    </main>
  );
}

