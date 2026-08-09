"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { AuthSession } from "@/lib/auth";

export function AuthStatus() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("benzo.session");
    setSession(stored ? (JSON.parse(stored) as AuthSession) : null);
  }, []);

  function logout() {
    window.localStorage.removeItem("benzo.session");
    window.location.assign("/auth/login");
  }

  if (!session) {
    return (
      <a className="inline-flex h-10 items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white" href="/auth/login">
        Login
      </a>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold">{session.user.name}</p>
        <p className="text-xs text-[var(--muted)]">
          {session.user.role} · {session.user.email}
        </p>
      </div>
      <button
        className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-sm font-semibold"
        type="button"
        onClick={logout}
      >
        <LogOut size={16} aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}
