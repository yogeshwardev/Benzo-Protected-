import { apiBaseUrl, parseApiError, saveSession, type AuthSession } from "@/lib/auth";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem("benzo.session");
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    window.localStorage.removeItem("benzo.session");
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("benzo.session");
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = getSession();

  if (!session) {
    throw new Error("Please login to continue.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers, cache: "no-store" });

  if (response.status === 401 && retry) {
    const refreshed = await refreshSession(session);
    if (refreshed) {
      return apiRequest<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function refreshSession(session: AuthSession) {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const refreshed = (await response.json()) as AuthSession;
  saveSession(refreshed);
  return true;
}

export function formatMoney(amountInPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amountInPaise / 100);
}

export function formatDate(value: string | Date, includeTime = false) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {})
  }).format(new Date(value));
}
