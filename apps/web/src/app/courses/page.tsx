import { Clock, IndianRupee, Users } from "lucide-react";

const courses = [
  ["C Programming", "c-programming", "Monday-Saturday", "Foundational programming with live practice."],
  ["Python", "python", "Monday-Saturday", "Beginner-friendly Python for practical projects."],
  ["Java", "java", "Monday-Saturday", "Core Java, OOP, and interview-ready foundations."],
  ["C++", "cplusplus", "Monday-Saturday", "C++ programming, logic building, and problem solving."],
  [
    "Web Development Using AI",
    "web-development-using-ai",
    "Monday-Saturday",
    "Build modern web apps with AI-assisted workflows."
  ],
  ["DevOps", "devops", "Monday-Saturday", "Linux, CI/CD, containers, and deployment basics."],
  [
    "Linux Administration",
    "linux-administration",
    "Monday-Saturday",
    "Operate Linux systems with practical admin skills."
  ]
];

export default function CoursesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-3 border-b border-[var(--line)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Courses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Live instructor-led courses with recordings, materials, assignments, quizzes,
            attendance, chat, and certificate eligibility.
          </p>
        </div>
        <a
          href="/auth/register"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white"
        >
          Register
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(([title, slug, schedule, summary]) => (
          <article key={slug} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--muted)]">{summary}</p>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Clock size={16} aria-hidden="true" />
                <span>{schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <IndianRupee size={16} aria-hidden="true" />
                <span>Price is confirmed at checkout</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Users size={16} aria-hidden="true" />
                <span>One active instructor per course</span>
              </div>
            </div>
            <a
              href={`/courses/${slug}`}
              className="mt-5 inline-flex h-10 items-center rounded-md border border-[var(--line)] px-4 text-sm font-semibold"
            >
              View course
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}

