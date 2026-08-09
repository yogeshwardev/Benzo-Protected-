import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="page-grain grid min-h-screen place-items-center px-5 py-8">
      <section className="surface w-full max-w-md rounded-lg p-6">
        <a className="brand-wordmark text-sm font-black text-[var(--ink)]" href="/">
          BENZO
        </a>
        <h1 className="mt-4 text-3xl font-black text-[var(--ink)]">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Open your student, instructor, admin, or super-admin workspace.
        </p>
        <LoginForm />
        <div className="mt-4 flex justify-between text-sm text-[var(--muted)]">
          <a className="underlined-link font-bold text-[var(--brand)]" href="/auth/register">
            Create account
          </a>
          <a className="underlined-link font-bold text-[var(--brand)]" href="/auth/forgot-password">
            Forgot password
          </a>
        </div>
      </section>
    </main>
  );
}
