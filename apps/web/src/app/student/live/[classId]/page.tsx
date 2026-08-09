import { Mic, MonitorUp, Video } from "lucide-react";

export default async function StudentLiveClassPage({
  params
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
      <h1 className="text-3xl font-semibold">Live classroom</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Class {classId} uses backend-issued LiveKit room tokens after enrollment checks.
      </p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[Video, Mic, MonitorUp].map((Icon, index) => (
          <article key={index} className="rounded-lg border border-[var(--line)] bg-white p-5">
            <Icon className="mb-3 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="font-semibold">{["Camera", "Microphone", "Screen share"][index]}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              LiveKit permissions are scoped by role.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

