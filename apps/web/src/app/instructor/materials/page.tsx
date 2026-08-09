import { FileUp, ShieldCheck } from "lucide-react";

export default function InstructorMaterialsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Materials</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <FileUp className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">File metadata</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Materials store R2 keys, MIME type, size, lesson relation, and privacy state.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <ShieldCheck className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Controlled access</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Students can list materials only after enrollment is verified by the API.
          </p>
        </article>
      </section>
    </main>
  );
}

