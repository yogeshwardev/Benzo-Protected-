import { BookOpenCheck, FileText, PlaySquare, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const learningAreas: Array<[LucideIcon, string, string]> = [
  [BookOpenCheck, "Lessons", "Ordered modules and lessons."],
  [TrendingUp, "Progress", "Per-lesson completion tracking."],
  [FileText, "Materials", "Private course files."],
  [PlaySquare, "Recordings", "Controlled streaming metadata."]
];

export default async function StudentCourseLearningPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <a className="text-sm font-semibold text-[var(--brand)]" href="/student/courses">
        Back to my courses
      </a>
      <h1 className="mt-6 text-3xl font-semibold">Learning: {slug.replace(/-/g, " ")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Course outline, lesson progress, materials, and recordings are loaded through enrollment-scoped APIs.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {learningAreas.map(([Icon, title, body]) => (
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
