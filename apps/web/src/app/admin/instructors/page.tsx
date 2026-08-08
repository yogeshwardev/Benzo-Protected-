import { Plus, UserRoundCheck } from "lucide-react";

const rows = [
  ["Unassigned", "Python", "Set password pending"],
  ["Unassigned", "Java", "Set password pending"],
  ["Unassigned", "DevOps", "Set password pending"]
];

export default function AdminInstructorsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Instructor management</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Instructors are admin-created and can have one active course assignment.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white">
          <Plus size={18} aria-hidden="true" />
          New instructor
        </button>
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        {rows.map(([name, course, status]) => (
          <div
            key={course}
            className="grid gap-3 border-b border-[var(--line)] px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1fr]"
          >
            <span className="flex items-center gap-2 font-semibold">
              <UserRoundCheck size={17} className="text-[var(--brand)]" aria-hidden="true" />
              {name}
            </span>
            <span>{course}</span>
            <span className="text-[var(--muted)]">{status}</span>
          </div>
        ))}
      </section>
    </main>
  );
}

