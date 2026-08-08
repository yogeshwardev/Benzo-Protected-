import { notFound } from "next/navigation";
import { BookOpen, CalendarClock, MessageSquare, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const courseMap: Record<string, { title: string; summary: string }> = {
  "c-programming": {
    title: "C Programming",
    summary: "Foundational programming with live logic-building practice."
  },
  python: {
    title: "Python",
    summary: "Beginner-friendly Python for practical projects and automation."
  },
  java: {
    title: "Java",
    summary: "Core Java, OOP, and interview-ready foundations."
  },
  cplusplus: {
    title: "C++",
    summary: "C++ programming, logic building, and problem solving."
  },
  "web-development-using-ai": {
    title: "Web Development Using AI",
    summary: "Modern web development with AI-assisted workflows."
  },
  devops: {
    title: "DevOps",
    summary: "Linux, CI/CD, containers, and deployment basics."
  },
  "linux-administration": {
    title: "Linux Administration",
    summary: "Operate Linux systems with practical administration skills."
  }
};

const courseFeatures: Array<[LucideIcon, string, string]> = [
  [BookOpen, "Learning", "Recordings, materials, assignments, and quizzes."],
  [CalendarClock, "Schedule", "Fixed course timing managed by admin."],
  [MessageSquare, "Support", "Course chat and instructor private chat."],
  [ShieldCheck, "Access", "Enrollment and LiveKit authorization checked by backend."]
];

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courseMap[slug];

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8">
      <a className="text-sm font-semibold text-[var(--brand)]" href="/courses">
        Back to courses
      </a>
      <div className="mt-6 border-b border-[var(--line)] pb-8">
        <h1 className="text-4xl font-semibold">{course.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{course.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/auth/register"
            className="inline-flex h-11 items-center rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white"
          >
            Enroll with Razorpay checkout
          </a>
          <a
            href="/auth/login"
            className="inline-flex h-11 items-center rounded-md border border-[var(--line)] px-5 text-sm font-semibold"
          >
            Student login
          </a>
        </div>
      </div>

      <section className="grid gap-4 py-8 sm:grid-cols-2">
        {courseFeatures.map(([Icon, title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <Icon className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
