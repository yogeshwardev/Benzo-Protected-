import { BookOpen, IndianRupee, Plus, ToggleRight } from "lucide-react";

const rows: Array<[string, string, string, string]> = [
  ["Python", "BEGINNER", "INR 699", "Published"],
  ["Java", "BEGINNER", "INR 699", "Published"],
  ["DevOps", "BEGINNER", "INR 699", "Published"]
];

export default function AdminCoursesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Course management</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Admin controls course content, pricing, schedule, publication, and instructor assignment.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white">
          <Plus size={18} aria-hidden="true" />
          New course
        </button>
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--muted)]">
          <span>Course</span>
          <span>Difficulty</span>
          <span>Price</span>
          <span>Status</span>
        </div>
        {rows.map(([course, difficulty, price, status]) => (
          <div
            key={course}
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-b border-[var(--line)] px-4 py-4 text-sm last:border-b-0"
          >
            <span className="flex items-center gap-2 font-semibold">
              <BookOpen size={17} className="text-[var(--brand)]" aria-hidden="true" />
              {course}
            </span>
            <span>{difficulty}</span>
            <span className="flex items-center gap-1">
              <IndianRupee size={15} aria-hidden="true" />
              {price.replace("INR ", "")}
            </span>
            <span className="flex items-center gap-2 text-[var(--brand)]">
              <ToggleRight size={18} aria-hidden="true" />
              {status}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
