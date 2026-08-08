export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg border border-[var(--line)] bg-white p-6">
        <h1 className="text-2xl font-semibold">Student registration</h1>
        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Name
            <input className="h-11 rounded-md border border-[var(--line)] px-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input className="h-11 rounded-md border border-[var(--line)] px-3" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Referral code
            <input className="h-11 rounded-md border border-[var(--line)] px-3" />
          </label>
          <button className="h-11 rounded-md bg-[var(--brand)] font-semibold text-white" type="button">
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}

