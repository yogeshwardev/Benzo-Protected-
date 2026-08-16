import { CourseBrowser } from "./courses/course-browser";
import{
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Library,
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

const trustItems = [
  [Video, "Live instructor classes"],
  [Library, "Recorded access"],
  [ClipboardCheck, "Practical assignments"],
  [BookOpenCheck, "Interactive quizzes"],
  [BadgeCheck, "Verified certificates"],
  [ShieldCheck, "Secure payments"]
] as const;

const howItWorks = [
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
];

const productSections = [
  {
    Icon: Video,
    title: "Live classes with structure",
    body: "Students join only through verified access windows. Instructors get a teaching-first workflow instead of a generic meeting link."
  },
  {
    Icon: Library,
    title: "Recordings stay with the course",
    body: "Recorded classes become part of the student course workspace so revision does not get lost in chats or drives."
  },
  {
    Icon: ClipboardCheck,
    title: "Assignments and quizzes",
    body: "Practice work, quiz attempts, review status, and feedback stay connected to each enrollment."
  },
  {
    Icon: MessageSquareText,
    title: "Instructor interaction",
    body: "Course chat keeps questions close to the right instructor and the right enrolled student group."
  }
];

const faqs = [
  {
    question: "Are the courses live or recorded?",
    answer: "BENZO is live-first. Recordings are included so students can revise after class."
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
    answer: "No. Certificate eligibility depends on attendance, progress, assignments, and quizzes."
  }
];

export default function Home() {
  return (
    <main className="page-grain min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <a className="brand-wordmark flex items-center gap-2 text-xl font-black text-[var(--ink)]" href="/">
            <span className="brand-mark grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-sm text-white">B</span>
            BENZO
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-7 text-sm font-bold text-slate-700 md:flex">
            <a className="underlined-link" href="/courses">Courses</a>
            <a className="underlined-link" href="#how">How It Works</a>
            <a className="underlined-link" href="#why">About</a>
            <a className="underlined-link" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm font-bold text-slate-700 sm:inline" href="/auth/login">Login</a>
            <a className="brand-button inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold" href="/courses">
              Explore Courses <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[0.95fr_1.05fr] md:px-8 lg:py-24">
        <div className="self-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold tracking-wide text-blue-700">
            <Sparkles size={16} aria-hidden="true" />
            Premium live tech learning at an affordable price
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
            Learn Tech Live. Build Skills That Actually Matter.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Live instructor-led programming and technology courses with recordings, assignments,
            quizzes, chat support, secure payments, and certificates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="brand-button inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-black" href="/courses">
              Explore Courses <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
  href="#how"
>
  <PlayCircle size={18} aria-hidden="true" />
  See How It Works
</a>
          </div>
        </div>

        <div className="surface rounded-3xl p-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <div>
                <p className="text-xs font-black text-[var(--brand)]">Student dashboard</p>
                <h2 className="mt-1 font-black text-[var(--ink)]">Ready to continue learning?</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">LIVE TODAY</span>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl bg-[#f2f5ff] p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-white text-[var(--brand)]">
                    <Video size={22} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black text-[var(--muted)]">7:00 PM</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-[var(--ink)]">Python Programming</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Loops, conditions, and practical problem solving with instructor review.</p>
                <button className="mt-5 h-11 rounded-lg bg-[var(--brand)] px-5 text-sm font-black text-white">Join Class</button>
              </div>
              <div className="grid gap-4">
                {[
                  ["Course progress", "42%", "bg-[var(--brand)]"],
                  ["Pending assignment", "1", "bg-amber-500"],
                  ["Upcoming quiz", "Saturday", "bg-cyan-500"]
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-[var(--line)] bg-white p-4">
                    <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className={`h-2 flex-1 rounded-full ${color}`} />
                      <strong className="text-sm text-[var(--ink)]">{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-[var(--line)] px-5 py-px sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:px-8">
          {trustItems.map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 bg-white p-4">
              <Icon className="text-[var(--brand)]" size={20} aria-hidden="true" />
              <span className="text-sm font-black text-[var(--ink)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <SectionIntro eyebrow="Featured Courses" title="Start with practical technology foundations." body="No fake ratings, no inflated claims. Just the current BENZO course catalog with clear outcomes and pricing." />
        <div className="mt-8">
  <CourseBrowser />
</div>
              
      </section>

      <section id="how" className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionIntro eyebrow="How BENZO Works" title="A simple learning flow from class to certificate." body="The experience is designed around what students need to do next, not around admin screens." />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, index) => (
              <article key={item.title}  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.08)]"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">{index + 1}</span>
                  <h3 className="mt-5 text-lg font-black text-[var(--ink)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                </article>
              ))}
            </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <SectionIntro eyebrow="Learning Features" title="Everything a student expects after paying." body="BENZO connects live teaching, revision, assessment, support, and eligibility in one platform." />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {productSections.map(({ Icon, title, body }) => (
            <article key={title} className="app-card p-6">
              <Icon className="text-[var(--brand)]" size={28} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-black text-[var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
          <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)]">
            <WalletCards size={30} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black">Referral rewards that stay transparent.</h2>
            <p className="mt-4 leading-7 text-white/80">
              Friends can receive INR {referralValueInInr} off eligible checkout. Referrers earn wallet credit only after qualifying enrollment succeeds.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[#fbfcff] p-7">
            <BadgeCheck className="text-[var(--brand)]" size={30} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black text-[var(--ink)]">Certificates are earned, not decorative.</h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Public verification is tied to completion rules: progress, attendance, assignments, and quizzes.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <SectionIntro eyebrow="FAQ" title="Clear answers before a student pays." body="Trust comes from explaining the workflow plainly." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <article key={item.question} className="app-card p-5">
              <HelpCircle className="text-[var(--brand)]" size={22} aria-hidden="true" />
              <h3 className="mt-4 font-black text-[var(--ink)]">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="support" className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-black text-blue-600">Support and enrollment</p>
            <h2 className="mt-2 text-3xl font-black">Ready to explore a BENZO course?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-950/65">
              Create a student account, choose a course, and complete secure checkout when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-black text-white" href="/auth/register">
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-black text-white" href="/auth/login">Login</a>
          </div>
        </div>
      </section>

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

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black text-[var(--brand)]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}
