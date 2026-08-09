import { CheckCircle2, IndianRupee, XCircle } from "lucide-react";

export default function AdminWithdrawalsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Wallet withdrawals</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Admin reviews pending withdrawal requests, records transfer references, or rejects with a reason.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <IndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Reserved funds</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Request creation reserves wallet balance with a pending ledger debit.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <CheckCircle2 className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Mark paid</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Paid withdrawals settle the reserve and store the transfer reference.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <XCircle className="mb-3 text-[var(--danger)]" aria-hidden="true" />
          <h2 className="font-semibold">Reject</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Rejected withdrawals reverse the reservation and restore availability.
          </p>
        </article>
      </section>
    </main>
  );
}

