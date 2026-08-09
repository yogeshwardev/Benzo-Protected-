import { BadgeIndianRupee, FileClock, Send } from "lucide-react";

export default function InstructorSalaryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Salary</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <FileClock className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Pending items</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Salary items are generated from completed class attendance.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <BadgeIndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Approved amount</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Admin reviews and approves payable items before payout.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Send className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Payouts</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Paid salary groups include payment references.
          </p>
        </article>
      </section>
    </main>
  );
}

