import { BadgeCheck, QrCode } from "lucide-react";

type VerifyPageProps = {
  params: Promise<{ code: string }>;
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { code } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Certificate verification</h1>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <QrCode className="mb-3 text-[var(--brand)]" aria-hidden="true" />
        <p className="text-sm font-semibold text-[var(--muted)]">Certificate ID</p>
        <p className="mt-2 break-all text-2xl font-semibold">{code}</p>
        <div className="mt-5 flex items-start gap-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
          <BadgeCheck className="mt-0.5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
          <p className="text-sm leading-6 text-[var(--muted)]">
            The public API endpoint verifies whether this certificate is issued or revoked.
          </p>
        </div>
      </section>
    </main>
  );
}
