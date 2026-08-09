import { Award, BadgeCheck, QrCode } from "lucide-react";

const checks = [
  ["Attendance", "Minimum 80 percent across completed live classes."],
  ["Assignments", "Required submissions must be approved."],
  ["Quizzes", "Required quizzes must meet the configured passing score."],
  ["Completion", "Course lessons must be completed."]
];

export default function StudentCertificatesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Certificates</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Eligibility is calculated from course progress, attendance, assignments, and quizzes.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {checks.map(([title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <BadgeCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <Award className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Issued certificates</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Issued records include a unique certificate ID and verification URL.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <QrCode className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">QR verification</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Public verification checks the certificate status before showing it as valid.
          </p>
        </article>
      </section>
    </main>
  );
}
