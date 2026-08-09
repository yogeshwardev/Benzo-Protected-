import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-8">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <a className="text-sm font-semibold text-[var(--brand)]" href="/">
          BENZO
        </a>
        <h1 className="mt-4 text-2xl font-semibold">Student registration</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Create your student account and go straight to the student dashboard.
        </p>
        <RegisterForm />
        <p className="mt-4 text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <a className="font-medium text-[var(--brand)]" href="/auth/login">
            Login
          </a>
        </p>
      </section>
    </main>
  );
}
