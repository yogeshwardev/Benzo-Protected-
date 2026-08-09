import { BadgeIndianRupee, CheckCircle2, FileClock, Send } from "lucide-react";

const stages = [
  ["Generate", "Create salary items from official instructor attendance."],
  ["Approve", "Review pending items and adjust amount if needed."],
  ["Payout", "Group approved unpaid items with a payment reference."]
];

export default function AdminSalariesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Instructor salaries</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Salary items are calculated from attendance summaries and reviewed before payout.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {stages.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            {title === "Generate" ? (
              <FileClock className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : title === "Approve" ? (
              <CheckCircle2 className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : (
              <Send className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            )}
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
      <section className="mt-4 rounded-lg border border-[var(--line)] bg-white p-5">
        <BadgeIndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="font-semibold">Audit trail</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Approvals, rejections, and payouts write audit log entries.
        </p>
      </section>
    </main>
  );
}

