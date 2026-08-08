export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input className="h-11 rounded-md border border-[var(--line)] px-3" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <input className="h-11 rounded-md border border-[var(--line)] px-3" type="password" />
          </label>
          <button className="h-11 rounded-md bg-[var(--brand)] font-semibold text-white" type="button">
            Continue
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-[var(--muted)]">
          <a href="/auth/register">Create account</a>
          <a href="/auth/forgot-password">Forgot password</a>
        </div>
      </section>
    </main>
  );
}

