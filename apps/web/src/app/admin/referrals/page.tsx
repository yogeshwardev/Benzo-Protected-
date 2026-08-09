import { GitBranch, WalletCards } from "lucide-react";

export default function AdminReferralsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Referrals</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <GitBranch className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Referral state</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Registration creates pending referrals; successful payment completes them.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <WalletCards className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Wallet credit</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Referrer wallet credit is written through an idempotent ledger transaction.
          </p>
        </article>
      </section>
    </main>
  );
}

