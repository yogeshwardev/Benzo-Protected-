import { Download, IndianRupee } from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Payments</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Financial reporting starts from backend-settled orders, not browser totals.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold">
          <Download size={17} aria-hidden="true" />
          Export
        </button>
      </div>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <IndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="font-semibold">Settlement summary</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Gross sales, coupon discounts, referral discounts, wallet usage, refunds, and net
          revenue will be aggregated from order and payment records.
        </p>
      </section>
    </main>
  );
}

