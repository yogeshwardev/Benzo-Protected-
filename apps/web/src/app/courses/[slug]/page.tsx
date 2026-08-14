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
  Video,
} from "lucide-react";
import { BENZO } from "@benzo/shared";
import {
  courseCatalog,
  getCourseBySlug,
  getCourseImage,
} from "@/lib/course-catalog";

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

  const courseImage = getCourseImage(course.slug);

  return (
    <main className="page-grain min-h-screen">
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a className="brand-wordmark text-xl font-black text-[var(--ink)]" href="/">
            BENZO
          </a>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm font-bold text-slate-700 sm:inline" href="/courses">
              Courses
            </a>
            <a
              href="/auth/login"
              className="inline-flex h-10 items-center justify-center rounded-md border border-black/10 bg-white/70 px-4 text-sm font-black text-slate-900"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-black/10 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_360px] md:px-8">
          <div>
            <a className="underlined-link text-sm font-black text-[var(--brand)]" href="/courses">
              Back to courses
            </a>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={courseImage}
                  alt={course.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700">
                  {course.category}
                </span>

                <span className="rounded-full bg-cyan-50 px-3.5 py-1.5 text-xs font-extrabold text-cyan-700">
                  Live cohort
                </span>
              </div>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-[var(--ink)] md:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">{course.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/auth/register"
                className="brand-button inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-black"
              >
                Create account to enroll <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-black/10 bg-white px-6 text-sm font-black text-slate-900"
              >
                Student login
              </a>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <ShieldCheck size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-black text-[var(--ink)]">Course access</p>
                  <p className="text-xs font-semibold text-[var(--muted)]">Verified before lessons open</p>
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
            </div>
            <a
              href={`/checkout/${course.slug}`}
              className="brand-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-black"
            >
              Continue to secure checkout <ArrowRight size={18} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {courseFeatures.map(({ Icon: FeatureIcon, title, body }) => (
            <article key={title} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <FeatureIcon className="mb-4 text-[var(--brand)]" size={27} aria-hidden="true" />
              <h2 className="text-lg font-black text-[var(--ink)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[var(--ink)]">What you should be able to do</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {course.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-2 rounded-lg bg-[var(--brand-soft)] p-3 text-sm font-bold text-[var(--brand)]">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* HOW BENZO WORKS */}
      <section id="how" className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-[var(--brand)]">
              How BENZO Works
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">
              A simple learning flow from class to certificate.
            </h2>

            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              The experience is designed around what students need to do next,
              not around admin screens.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Choose a course",
                body: "Start with programming foundations, web development, Linux, or DevOps from the BENZO catalog."
              },
              {
                title: "Attend live classes",
                body: "Join scheduled sessions, ask questions, and keep attendance tied to official class time."
              },
              {
                title: "Practice and submit",
                body: "Use recordings, materials, assignments, and quizzes to build proof that you learned."
              },
              {
                title: "Earn completion proof",
                body: "Certificates are issued only when progress, attendance, and assessment rules are satisfied."
              }
            ].map((item, index) => (
              <article
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.08)]"
              >
                <span className="grid size-10 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">
                  {index + 1}
                </span>

                <h3 className="mt-5 text-lg font-black text-[var(--ink)]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING FEATURES */}
      <section id="why" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-[var(--brand)]">
            Learning Features
          </p>

          <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">
            Everything a student expects after paying.
          </h2>

          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            BENZO connects live teaching, revision, assessment, support, and
            eligibility in one platform.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              Icon: Video,
              title: "Live classes with structure",
              body: "Students join only through verified access windows. Instructors get a teaching-first workflow instead of a generic meeting link."
            },
            {
              Icon: BookOpen,
              title: "Recordings stay with the course",
              body: "Recorded classes become part of the student course workspace so revision does not get lost in chats or drives."
            },
            {
              Icon: CheckCircle2,
              title: "Assignments and quizzes",
              body: "Practice work, quiz attempts, review status, and feedback stay connected to each enrollment."
            },
            {
              Icon: MessageSquare,
              title: "Instructor interaction",
              body: "Course chat keeps questions close to the right instructor and the right enrolled student group."
            }
          ].map(({ Icon, title, body }) => (
            <article key={title} className="app-card p-6">
              <Icon
                className="text-[var(--brand)]"
                size={28}
                aria-hidden="true"
              />

              <h3 className="mt-4 text-xl font-black text-[var(--ink)]">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* REFERRAL + CERTIFICATES */}
      <section className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
          <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
            <h2 className="text-3xl font-black">
              Referral rewards that stay transparent.
            </h2>

            <p className="mt-4 leading-7 text-white/80">
              Friends can receive INR {referralValueInInr} off eligible
              checkout. Referrers earn wallet credit only after qualifying
              enrollment succeeds.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[#fbfcff] p-7">
            <BadgeCheck
              className="text-[var(--brand)]"
              size={30}
              aria-hidden="true"
            />

            <h2 className="mt-5 text-3xl font-black text-[var(--ink)]">
              Certificates are earned, not decorative.
            </h2>

            <p className="mt-4 leading-7 text-[var(--muted)]">
              Public verification is tied to completion rules: progress,
              attendance, assignments, and quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-[var(--brand)]">FAQ</p>

          <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">
            Clear answers before a student pays.
          </h2>

          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Trust comes from explaining the workflow plainly.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              question: "Are the courses live or recorded?",
              answer:
                "BENZO is live-first. Recordings are included so students can revise after class."
            },
            {
              question: "How much does a course cost?",
              answer: `The current target course price shown in the app is INR ${coursePriceInInr}. Final checkout is calculated by the backend.`
            },
            {
              question: "Can referral codes be used?",
              answer: `Eligible referral codes can reduce checkout by INR ${referralValueInInr}. Referrer wallet credit is issued after qualifying enrollment.`
            },
            {
              question: "Are certificates automatic?",
              answer:
                "No. Certificate eligibility depends on attendance, progress, assignments, and quizzes."
            }
          ].map((item) => (
            <article key={item.question} className="app-card p-5">
              <h3 className="font-black text-[var(--ink)]">
                {item.question}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-black text-blue-600">
              Support and enrollment
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Ready to explore a BENZO course?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-950/65">
              Create a student account, choose a course, and complete secure
              checkout when you are ready.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-black text-white"
              href="/auth/register"
            >
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </a>

            <a
              className="inline-flex h-12 items-center justify-center rounded-lg border border-black/10 px-6 text-sm font-black text-slate-900"
              href="/auth/login"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-black text-[var(--ink)]">BENZO</p>

          <div className="flex flex-wrap gap-4">
            <a href="/courses">Courses</a>
            <a href="#how">How It Works</a>
            <a href="#faq">FAQ</a>
            <a href={BENZO.productionUrl}>{BENZO.productionUrl}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
