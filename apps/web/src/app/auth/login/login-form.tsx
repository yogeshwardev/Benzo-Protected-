"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiBaseUrl, parseApiError, roleHome, saveSession, type AuthSession } from "@/lib/auth";

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
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const session = (await response.json()) as AuthSession;
      saveSession(session);
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination =
        session.user.role === "STUDENT" && requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
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
    <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
      <label className="grid gap-2 text-sm font-bold text-slate-800">
        Email
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-800">
        Password
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </label>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      <button
        className="brand-button inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 font-bold disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
        Login <ArrowRight size={18} aria-hidden="true" />
      </button>
      <div className="rounded-xl border border-blue-100 bg-[var(--brand-soft)] p-3 text-sm text-slate-800">
        <p className="font-black">Test accounts</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([
            ["Student", "student@benzo.test"],
            ["Instructor", "instructor@benzo.test"],
            ["Admin", "admin@benzo.test"],
            ["Super admin", "superadmin@benzo.test"]
          ] as const).map(([label, accountEmail]) => (
            <button key={accountEmail} className="h-9 rounded-lg border border-blue-200 bg-white px-2 text-xs font-black text-[var(--brand)]" type="button" onClick={() => useTestAccount(accountEmail)}>
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">All accounts use password Benzo@123</p>
      </div>
    </form>
  );
}
