"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  apiBaseUrl,
  parseApiError,
  roleHome,
  saveSession,
  type AuthSession,
} from "@/lib/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function useTestAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("Benzo@123");
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const session = (await response.json()) as AuthSession;
      saveSession(session);
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination =
        session.user.role === "STUDENT" &&
        requestedPath?.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : roleHome(session.user.role);

      window.location.assign(destination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={(event) => void submit(event)}>
      <label className="grid gap-2.5 text-sm font-bold text-slate-800">
        Email
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            className="field h-13 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-blue-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </label>

      <label className="grid gap-2.5 text-sm font-bold text-slate-800">
        Password
        <div className="relative">
          <LockKeyhole
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            className="field h-13 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-blue-100"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            minLength={8}
          />
        </div>
      </label>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <button
        className="brand-button mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
        ) : null}
        {loading ? "Signing in..." : "Sign in"}
        {!loading ? <ArrowRight size={18} aria-hidden="true" /> : null}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-[var(--brand)]">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-black text-slate-900">Quick test access</p>
            <p className="text-xs text-slate-500">Use a demo account to explore BENZO</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {([
            ["Student", "student@benzo.test"],
            ["Instructor", "instructor@benzo.test"],
            ["Admin", "admin@benzo.test"],
            ["Super admin", "superadmin@benzo.test"],
          ] as const).map(([label, accountEmail]) => (
            <button
              key={accountEmail}
              className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
  label === "Student"
    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
    : label === "Instructor"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : label === "Admin"
        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
        : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
}`}
              type="button"
              onClick={() => useTestAccount(accountEmail)}
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          Demo password: <span className="font-bold">Benzo@123</span>
        </p>
      </div>
    </form>
  );
}