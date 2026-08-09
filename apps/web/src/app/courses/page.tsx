import { ArrowRight, BadgeCheck, CalendarClock, IndianRupee, ShieldCheck } from "lucide-react";
import { BENZO } from "@benzo/shared";
import { courseCatalog } from "@/lib/course-catalog";
import { CourseBrowser } from "./course-browser";

const coursePriceInInr = 699;
const referralValueInInr = BENZO.referralDiscountInPaise / 100;

export default function CoursesPage() {
  return (
    <main className="page-grain min-h-screen">
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a className="brand-wordmark text-xl font-black text-[var(--ink)]" href="/">
            BENZO
          </a>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm font-bold text-slate-700 sm:inline" href="/auth/login">
              Login
            </a>
            <a
              href="/auth/register"
              className="brand-button inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-black"
            >
              Register <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-black/10 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_340px] md:px-8">
          <div>
            <a className="underlined-link text-sm font-black text-[var(--brand)]" href="/">
              Back to home
            </a>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-[var(--ink)] md:text-5xl">
              Choose the course that matches your next real step.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              Search BENZO's catalog by language, track, or outcome. Every course is wired for live
              attendance, recordings, materials, assignments, quizzes, chat, checkout, invoices, and certificates.
            </p>
          </div>

          <aside className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-[var(--ink)]">Catalog facts</p>
                <p className="text-xs font-semibold text-[var(--muted)]">Rules enforced in the backend</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
                <dt className="flex items-center gap-2 text-[var(--muted)]">
                  <BadgeCheck size={16} aria-hidden="true" />
                  Courses
                </dt>
                <dd className="font-black">{courseCatalog.length}</dd>
              </div>
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
                  Attendance
                </dt>
                <dd className="font-black">{BENZO.presentThresholdPercent}%</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              Eligible referral codes can discount a student by INR {referralValueInInr}; wallet credit is issued only after enrollment rules pass.
            </p>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <CourseBrowser />
      </div>
    </main>
  );
}
