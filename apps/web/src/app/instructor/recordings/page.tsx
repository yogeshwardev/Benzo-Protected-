import { PlaySquare, RadioTower } from "lucide-react";

export default function InstructorRecordingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Recordings</h1>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <RadioTower className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Processing status</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Recordings track pending, processing, ready, and failed states.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--line)] bg-white p-5">
          <PlaySquare className="mb-3 text-[var(--brand)]" aria-hidden="true" />
          <h2 className="font-semibold">Bunny Stream</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The API returns provider metadata for controlled playback, not raw MP4 links.
          </p>
        </article>
      </section>
    </main>
  );
}

