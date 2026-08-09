import { FileText, ShieldCheck } from "lucide-react";

export default function StudentPaymentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Payments</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Orders, Razorpay payment status, and invoices will appear after checkout.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Secure checkout</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The backend calculates price, discounts, wallet use, and Razorpay order details.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <FileText className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Invoices</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Paid order settlement creates an invoice record exactly once.
          </p>
        </article>
      </section>
    </main>
  );
}

