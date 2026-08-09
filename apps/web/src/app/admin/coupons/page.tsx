import { Plus, TicketPercent } from "lucide-react";

export default function AdminCouponsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Coupons</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Coupons are validated during backend checkout quote calculation.
          </p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white">
          <Plus size={17} aria-hidden="true" />
          New coupon
        </button>
      </div>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <TicketPercent className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="font-semibold">Discount source</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Paid settlement records coupon redemptions once, even if Razorpay sends duplicate events.
        </p>
      </section>
    </main>
  );
}

