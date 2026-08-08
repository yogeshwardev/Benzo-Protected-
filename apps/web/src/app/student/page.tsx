export default function StudentDashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Student dashboard</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {["Next live class", "My courses", "Referral wallet"].map((item) => (
          <article key={item} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Built around the next action a student should take.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

