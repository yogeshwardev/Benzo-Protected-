import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <a className="text-sm font-semibold text-[var(--brand)]" href="/auth/login">
          Back to login
        </a>
        <h1 className="mt-4 text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Enter your account email and BENZO will create a reset link.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
