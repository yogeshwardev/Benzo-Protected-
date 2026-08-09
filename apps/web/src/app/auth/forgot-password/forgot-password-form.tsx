"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { apiBaseUrl, parseApiError } from "@/lib/auth";

type ForgotResponse = {
  success: true;
  reset?: {
    devToken?: string;
    expiresAt: string;
  };
};

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDevToken(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const payload = (await response.json()) as ForgotResponse;
      setMessage("If the email exists, a password reset link has been created.");
      setDevToken(payload.reset?.devToken ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to request password reset.");
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
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-[var(--brand-strong)]">
          {message}
        </p>
      ) : null}
      {devToken ? (
        <a
          className="break-all rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--brand)]"
          href={`/auth/reset-password?token=${encodeURIComponent(devToken)}`}
        >
          Development reset link: {devToken}
        </a>
      ) : null}
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Mail size={18} />}
        Send reset link
      </button>
    </form>
  );
}
