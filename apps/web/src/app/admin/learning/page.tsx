import { BookOpenCheck, Layers3, PlaySquare, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const areas: Array<[LucideIcon, string, string]> = [
  [Layers3, "Modules", "Organize each course into ordered modules."],
  [BookOpenCheck, "Lessons", "Create lesson content, duration, and preview state."],
  [Upload, "Materials", "Attach R2-backed course files without exposing raw storage paths."],
  [PlaySquare, "Recordings", "Register Bunny Stream video metadata for controlled playback."]
];

export default function AdminLearningPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Learning content</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Manage course modules, lessons, materials, recordings, and progress visibility.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {areas.map(([Icon, title, body]) => (
          <article key={title} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <Icon className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
