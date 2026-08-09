"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiBaseUrl, parseApiError, roleHome, saveSession, type AuthSession } from "@/lib/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      window.location.assign(roleHome(session.user.role));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          className="h-11 rounded-md border border-[var(--line)] px-3"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input
          className="h-11 rounded-md border border-[var(--line)] px-3"
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
        Login <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
