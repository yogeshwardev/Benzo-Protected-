import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  MessageSquare,
  ShieldCheck,
  Video
} from "lucide-react";
import { BENZO } from "@benzo/shared";
import { courseCatalog, getCourseBySlug } from "@/lib/course-catalog";

const coursePriceInInr = 699;
const referralValueInInr = BENZO.referralDiscountInPaise / 100;

const courseFeatures = [
  {
    Icon: Video,
    title: "Live classes",
    body: "Join scheduled sessions through backend-authorized live classroom access."
  },
  {
    Icon: BookOpen,
    title: "Practice workflow",
    body: "Use recordings, materials, assignments, quizzes, and progress tracking inside the student area."
  },
  {
    Icon: MessageSquare,
    title: "Course support",
    body: "Ask questions in course chat and receive instructor-scoped replies when enrolled."
  },
  {
    Icon: BadgeCheck,
    title: "Certificate eligibility",
    body: "Completion depends on attendance, assignment, quiz, and progress requirements."
  }
];

export function generateStaticParams() {
  return courseCatalog.map((course) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const Icon = course.Icon;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a className="text-xl font-black text-[var(--brand)]" href="/">
            BENZO
          </a>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm font-bold text-slate-700 sm:inline" href="/courses">
              Courses
            </a>
            <a
              href="/auth/login"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--line)] px-4 text-sm font-black text-slate-900"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_360px] md:px-8">
          <div>
            <a className="text-sm font-black text-[var(--brand)]" href="/courses">
              Back to courses
            </a>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`flex size-14 items-center justify-center rounded-md bg-gradient-to-br ${course.accent} text-white`}>
                <Icon size={27} aria-hidden="true" />
              </span>
              <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {course.category}
              </span>
              <span className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800">
                Live cohort
              </span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">{course.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/auth/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-6 text-sm font-black text-white"
              >
                Create account to enroll <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--line)] bg-white px-6 text-sm font-black text-slate-900"
              >
                Student login
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-[var(--line)] bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-md bg-teal-100 text-[var(--brand)]">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="font-black text-slate-950">Course access</p>
                <p className="text-xs font-semibold text-[var(--muted)]">Verified by backend</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                <dt className="flex items-center gap-2 text-[var(--muted)]">
                  <IndianRupee size={16} aria-hidden="true" />
                  Target price
                </dt>
                <dd className="font-black">INR {coursePriceInInr}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                <dt className="flex items-center gap-2 text-[var(--muted)]">
                  <CalendarClock size={16} aria-hidden="true" />
                  Schedule
                </dt>
                <dd className="font-black">{course.schedule}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                <dt className="flex items-center gap-2 text-[var(--muted)]">
                  <BadgeCheck size={16} aria-hidden="true" />
                  Attendance target
                </dt>
                <dd className="font-black">{BENZO.presentThresholdPercent}%</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              Referral codes can discount eligible checkout by INR {referralValueInInr}. Final totals are calculated server-side.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {courseFeatures.map(({ Icon: FeatureIcon, title, body }) => (
            <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
              <FeatureIcon className="mb-4 text-[var(--brand)]" size={27} aria-hidden="true" />
              <h2 className="text-lg font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">What you should be able to do</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {course.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-2 rounded-md bg-teal-50 p-3 text-sm font-bold text-[var(--brand)]">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
