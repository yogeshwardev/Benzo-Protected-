import { Award, Ban, QrCode } from "lucide-react";

const operations = [
  ["Eligibility", "Review the calculated requirement snapshot before issuing."],
  ["Issue", "Create a certificate with a unique verification code."],
  ["Revoke", "Revoke invalid certificates with a required reason."]
];

export default function AdminCertificatesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Certificates</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Certificate records are tied to enrollment, course completion, and public verification.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {operations.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            {title === "Revoke" ? (
              <Ban className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : title === "Issue" ? (
              <Award className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            ) : (
              <QrCode className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            )}
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
