export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function roleHome(role: AuthUser["role"]) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return "/admin";
  }

  if (role === "INSTRUCTOR") {
    return "/instructor";
  }

  return "/student";
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem("benzo.session", JSON.stringify(session));
}

export async function parseApiError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[]; error?: string };
    const message = Array.isArray(payload.message) ? payload.message.join(" ") : payload.message;
    return message ?? payload.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}
