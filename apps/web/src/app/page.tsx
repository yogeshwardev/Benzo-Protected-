import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  MessageSquareText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Video,
  WalletCards
} from "lucide-react";
import { BENZO } from "@benzo/shared";
import { courseCatalog } from "@/lib/course-catalog";

const coursePriceInInr = 699;
const referralValueInInr = BENZO.referralDiscountInPaise / 100;

const stats = [
  { label: "Live tech courses", value: `${courseCatalog.length}` },
  { label: "Attendance target", value: `${BENZO.presentThresholdPercent}%` },
  { label: "Early join window", value: `${BENZO.instructorEarlyJoinMinutes} min` },
  { label: "Target course price", value: `INR ${coursePriceInInr}` }
];

const paths = [
  {
    title: "Code Foundations",
    body: "C Programming, C++, Java, and Python for students who need strong fundamentals.",
    courses: ["C Programming", "C++", "Java", "Python"]
  },
  {
    title: "AI Web Builder",
    body: "Web Development Using AI plus Python practice for portfolio-ready web projects.",
    courses: ["Web Development Using AI", "Python", "DevOps"]
  },
  {
    title: "Systems Starter",
    body: "Linux Administration and DevOps for learners moving toward deployment and operations.",
    courses: ["Linux Administration", "DevOps"]
  }
];

const reasons = [
  {
    Icon: Video,
    title: "Live classes first",
    body: "Courses are built around scheduled instructor sessions, recordings, and valid access checks."
  },
  {
    Icon: MessageSquareText,
    title: "Support stays scoped",
    body: "Course chat, private instructor messages, announcements, and notifications stay tied to enrollment."
  },
  {
    Icon: BadgeCheck,
    title: "Verified certificates",
    body: "Eligibility depends on progress, attendance, assignments, and quizzes before public verification."
  },
  {
    Icon: WalletCards,
    title: "Referral wallet logic",
    body: `Students can use referral benefits worth INR ${referralValueInInr} where eligible.`
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <a className="flex items-center gap-2 text-xl font-black text-[var(--brand)]" href="/">
            <span className="flex size-9 items-center justify-center rounded-md bg-[var(--brand)] text-sm text-white">
              B
            </span>
            BENZO
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <a href="/courses">Courses</a>
            <a href="#paths">Career paths</a>
            <a href="#why">Why BENZO</a>
            <a href="/auth/login">Login</a>
          </nav>
          <a
            href="/auth/register"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm"
          >
            Sign up <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="border-b border-amber-200 bg-amber-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-5 py-3 text-center text-sm font-bold text-amber-950 md:px-8">
          <Sparkles size={17} aria-hidden="true" />
          Referral benefit: save INR {referralValueInInr} with an eligible code. Referrers earn wallet credit after enrollment.
        </div>
      </section>

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid min-h-[calc(100vh-112px)] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 md:grid-cols-[0.92fr_1.08fr] md:px-8 lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-[var(--brand)]">
              <ShieldCheck size={17} aria-hidden="true" />
              Instructor-led technology learning
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Learn coding live with mentors, practice, attendance, and verified certificates.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              BENZO turns beginner tech courses into a real learning workflow: scheduled live classes,
              recordings, assignments, quizzes, chat support, referrals, payments, and certificate checks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/courses"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-6 text-sm font-bold text-white shadow-[0_16px_32px_rgba(15,118,110,0.22)]"
              >
                Explore courses <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-6 text-sm font-bold text-slate-900"
              >
                <PlayCircle size={18} aria-hidden="true" />
                Student login
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-md border border-[var(--line)] bg-slate-50 p-3">
                  <div className="text-lg font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-xs font-semibold leading-5 text-[var(--muted)]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 hidden rounded-md border border-[var(--line)] bg-white p-4 shadow-xl lg:block">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <CalendarClock size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">Next class</p>
                  <p className="text-sm font-black">Python at 7:00 PM</p>
                </div>
              </div>
            </div>
            <Image
              src="/images/benzo-learning-dashboard.png"
              alt="BENZO live learning dashboard showing courses, progress, assignments, and certificates"
              width={1600}
              height={900}
              priority
              className="w-full rounded-lg border border-slate-200 shadow-2xl"
            />
            <div className="absolute bottom-5 right-5 hidden max-w-xs rounded-md border border-teal-200 bg-white/95 p-4 shadow-xl sm:block">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                  <IndianRupee size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black">Backend-controlled checkout</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Course pricing, coupons, orders, invoices, and enrollments are verified server-side.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[var(--brand)]">Course catalog</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
              Practical courses created for live practice
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Browse the same initial courses seeded into BENZO. Each course is designed for attendance,
              assignments, quizzes, instructor support, and certificate eligibility.
            </p>
          </div>
          <a
            href="/courses"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-5 text-sm font-bold text-slate-900"
          >
            Open full catalog <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courseCatalog.slice(0, 6).map((course) => {
            const Icon = course.Icon;

            return (
              <article key={course.slug} className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-sm">
                <div className={`h-2 bg-gradient-to-r ${course.accent}`} />
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {course.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                      <CalendarClock size={14} aria-hidden="true" />
                      Live schedule
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-slate-950">{course.title}</h3>
                      <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--muted)]">{course.summary}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {course.outcomes.slice(0, 2).map((outcome) => (
                      <span key={outcome} className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-[var(--brand)]">
                        <CheckCircle2 size={13} aria-hidden="true" />
                        {outcome}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)]">Target price</p>
                      <p className="text-lg font-black text-slate-950">INR {coursePriceInInr}</p>
                    </div>
                    <a
                      href={`/courses/${course.slug}`}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white"
                    >
                      View course
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="paths" className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase text-[var(--brand)]">Career paths</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
              Path recommendations without fake bundle promises
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              These paths help students choose an order of learning. Enrollment, payments, access,
              and certificates still stay course-based inside BENZO.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {paths.map((path) => (
              <article key={path.title} className="rounded-lg border border-[var(--line)] bg-slate-50 p-5">
                <h3 className="text-xl font-black text-slate-950">{path.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{path.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {path.courses.map((course) => (
                    <span key={course} className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
                      {course}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase text-[var(--brand)]">Why BENZO</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
            Built like a learning operation, not a static course list
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ Icon, title, body }) => (
            <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
              <Icon className="mb-4 text-[var(--brand)]" size={26} aria-hidden="true" />
              <h3 className="font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-black uppercase text-teal-300">Start learning</p>
            <h2 className="mt-2 text-3xl font-black">Create your student account and enter the BENZO dashboard.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Register, complete checkout when courses are available, attend live classes, submit work,
              and track certificate eligibility from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/auth/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-400 px-6 text-sm font-black text-slate-950"
            >
              Create student account <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-6 text-sm font-black text-white"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-bold text-slate-900">BENZO</p>
          <div className="flex flex-wrap gap-4">
            <a href="/courses">Courses</a>
            <a href="/auth/login">Login</a>
            <a href="/auth/register">Register</a>
            <a href={BENZO.productionUrl}>{BENZO.productionUrl}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
