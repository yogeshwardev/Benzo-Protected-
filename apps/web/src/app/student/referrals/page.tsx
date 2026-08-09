import { Gift, Link2 } from "lucide-react";
import { BENZO } from "@benzo/shared";

export default function StudentReferralsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Referrals</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Link2 className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Referral code</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Every student receives a unique BENZO referral code.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Gift className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Reward rule</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Referred students get INR {BENZO.referralDiscountInPaise / 100} off, and the
            referrer earns INR {BENZO.referralCreditInPaise / 100} after a paid order.
          </p>
        </article>
      </section>
    </main>
  );
}

