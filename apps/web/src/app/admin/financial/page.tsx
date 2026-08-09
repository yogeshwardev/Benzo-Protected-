import { Download, Filter, IndianRupee, ReceiptText } from "lucide-react";

const summaries = [
  ["Gross sales", "Backend-paid order base totals"],
  ["Discounts", "Coupon, referral, and wallet use"],
  ["Net revenue", "Paid final amount minus refunds"],
  ["Failures", "Failed payment count"]
];

export default function AdminFinancialPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Financial reports</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Filter by date, course, student, and payment status. CSV export respects the same filters.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold">
            <Filter size={17} aria-hidden="true" />
            Filters
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white">
            <Download size={17} aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {summaries.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            {title === "Gross sales" ? (
              <IndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : (
              <ReceiptText className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            )}
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

