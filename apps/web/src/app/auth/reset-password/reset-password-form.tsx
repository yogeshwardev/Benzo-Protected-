"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiBaseUrl, parseApiError } from "@/lib/auth";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      setMessage("Password reset complete. You can login now.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
      <label className="grid gap-2 text-sm font-medium">
        Reset token
        <textarea
          className="min-h-24 rounded-md border border-[var(--line)] px-3 py-2"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          minLength={20}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        New password
        <input
          className="h-11 rounded-md border border-[var(--line)] px-3"
          type="password"
          autoComplete="new-password"
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
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-[var(--brand-strong)]">
          {message}
        </p>
      ) : null}
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <CheckCircle2 size={18} />}
        Save password
      </button>
    </form>
  );
}
