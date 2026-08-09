import { IndianRupee, WalletCards } from "lucide-react";
import { BENZO } from "@benzo/shared";

export default function StudentWalletPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Referral wallet</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <WalletCards className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Ledger balance</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Balance is derived from settled wallet transactions, not an editable number.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <IndianRupee className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Minimum withdrawal</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            INR {BENZO.minimumWithdrawalInPaise / 100} is required before withdrawal.
          </p>
        </article>
      </section>
    </main>
  );
}

