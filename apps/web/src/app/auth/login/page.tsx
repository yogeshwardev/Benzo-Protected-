import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eef3f9] p-4 sm:p-6 lg:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        
        {/* =====================================================
            LEFT BRAND PANEL
        ===================================================== */}

        <div className="relative hidden overflow-hidden bg-[#2454C6] lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
          
          {/* Decorative shapes */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.06]" />
          <div className="absolute -bottom-32 -left-28 h-80 w-80 rounded-full border-[55px] border-white/[0.05]" />
          <div className="absolute right-16 top-1/2 h-32 w-32 rounded-full bg-white/[0.04]" />

          <div className="relative z-10 p-10 xl:p-12">
            {/* Brand */}
            <a
              href="/"
              className="inline-flex items-center gap-3 text-white"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-base font-black text-[#2454C6] shadow-[0_10px_25px_rgba(0,0,0,0.16)]">
                B
              </span>

              <span className="text-xl font-black tracking-[-0.03em]">
                BENZO
              </span>
            </a>

            {/* Main message */}
            <div className="mt-20 max-w-sm">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm">
                <Sparkles size={14} />
                Learn. Build. Grow.
              </div>

              <h2 className="text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white xl:text-5xl">
                Your learning journey starts here.
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-blue-100">
                Learn practical technology skills through live courses,
                guided assignments, assessments, and real instructor support.
              </p>
            </div>

            {/* Feature list */}
            <div className="mt-9 space-y-4">
              {[
                "Live instructor-led learning",
                "Assignments and assessments",
                "Course progress tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold text-white"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-white/10">
                    <CheckCircle2 size={16} />
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom mini card */}
          <div className="relative z-10 p-10 pt-0 xl:p-12 xl:pt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
                  <BookOpen size={19} />
                </span>

                <div>
                  <p className="text-sm font-bold text-white">
                    One workspace
                  </p>
                  <p className="mt-0.5 text-xs text-blue-100/70">
                    Courses, progress, assignments & more
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ===================================================== */}

        <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            
            {/* Mobile brand */}
            <a
              href="/"
              className="mb-10 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[#2563eb] text-base font-black text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
                B
              </span>

              <span className="text-xl font-black tracking-tight text-[#172033]">
                BENZO
              </span>
            </a>

            {/* Heading */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                <Sparkles size={13} aria-hidden="true" />
                Learning workspace
              </div>

              <h1 className="text-[38px] font-black leading-[1.05] tracking-[-0.045em] text-[#172033] sm:text-[42px]">
                Welcome back
              </h1>

              <p className="mt-3 max-w-md text-[15px] leading-6 text-slate-500">
                Sign in to continue learning and access your BENZO courses,
                assignments, and progress.
              </p>
            </div>

            {/* Login */}
            <div className="mt-8">
              <LoginForm />
            </div>

            {/* Links */}
            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
              <a
                href="/auth/register"
                className="group inline-flex items-center gap-1.5 text-sm font-extrabold text-[#2563eb] transition hover:text-[#1d4ed8]"
              >
                Create account
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>

              <a
                href="/auth/forgot-password"
                className="text-sm font-bold text-slate-500 transition hover:text-[#2563eb]"
              >
                Forgot password?
              </a>
            </div>

            {/* Security */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2563eb]">
                <ShieldCheck size={18} />
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#172033]">
                  Secure learning account
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Your account, course access, and learning progress are
                  protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}