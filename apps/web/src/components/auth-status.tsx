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
      <a className="brand-button inline-flex h-10 items-center rounded-md px-4 text-sm font-bold" href="/auth/login">
        Login
      </a>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-bold text-[var(--ink)]">{session.user.name}</p>
        <p className="text-xs text-[var(--muted)]">
          {session.user.role} / {session.user.email}
        </p>
      </div>
      <button
        className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm font-bold"
        type="button"
        onClick={logout}
      >
        <LogOut size={16} aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}
