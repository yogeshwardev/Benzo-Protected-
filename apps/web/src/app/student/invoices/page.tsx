import { FileText, ShieldCheck } from "lucide-react";

export default function StudentInvoicesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Invoices</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <FileText className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Paid order invoices</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Invoice records are created once during paid order settlement.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Private access</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Students can access only their own invoice metadata.
          </p>
        </article>
      </section>
    </main>
  );
}

