import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="page-grain grid min-h-screen place-items-center px-5 py-8">
      <section className="surface w-full max-w-md rounded-lg p-6">
        <a className="brand-wordmark text-sm font-black text-[var(--ink)]" href="/">
          BENZO
        </a>
        <h1 className="mt-4 text-3xl font-black text-[var(--ink)]">Create student account</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Set up your account, then continue straight into the student dashboard.
        </p>
        <RegisterForm />
        <p className="mt-4 text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <a className="underlined-link font-bold text-[var(--brand)]" href="/auth/login">
            Login
          </a>
        </p>
      </section>
    </main>
  );
}
