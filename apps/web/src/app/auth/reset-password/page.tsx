import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <a className="text-sm font-semibold text-[var(--brand)]" href="/auth/login">
          Back to login
        </a>
        <h1 className="mt-4 text-2xl font-semibold">Choose new password</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Paste the reset token from your email or development reset link.
        </p>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
