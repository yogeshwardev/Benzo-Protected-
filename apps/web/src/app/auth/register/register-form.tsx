"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiBaseUrl, parseApiError, roleHome, saveSession, type AuthSession } from "@/lib/auth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      mobile: mobile.trim() || undefined,
      referralCode: referralCode.trim() || undefined
    };

    try {
      const registerResponse = await fetch(`${apiBaseUrl}/auth/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!registerResponse.ok) {
        throw new Error(await parseApiError(registerResponse));
      }

      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!loginResponse.ok) {
        throw new Error("Account created. Please login with your new password.");
      }

      const session = (await loginResponse.json()) as AuthSession;
      saveSession(session);
      window.location.assign(roleHome(session.user.role));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
      <label className="grid gap-2 text-sm font-bold text-slate-800">
        Name
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
        />
      </label>
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
        Mobile
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          type="tel"
          autoComplete="tel"
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          minLength={8}
          maxLength={20}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-800">
        Password
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-800">
        Referral code
        <input
          className="field h-11 rounded-md px-3 outline-none transition"
          value={referralCode}
          onChange={(event) => setReferralCode(event.target.value)}
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
        Create account <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
