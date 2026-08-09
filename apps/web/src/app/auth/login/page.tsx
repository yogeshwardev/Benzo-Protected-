import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <a className="text-sm font-semibold text-[var(--brand)]" href="/">
          BENZO
        </a>
        <h1 className="mt-4 text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Use your student, instructor, admin, or super-admin account.
        </p>
        <LoginForm />
        <div className="mt-4 flex justify-between text-sm text-[var(--muted)]">
          <a className="font-medium text-[var(--brand)]" href="/auth/register">
            Create account
          </a>
          <a className="font-medium text-[var(--brand)]" href="/auth/forgot-password">
            Forgot password
          </a>
        </div>
      </section>
    </main>
  );
}
