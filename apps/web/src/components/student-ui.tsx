import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function PageHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-black text-[var(--brand)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function LoadingState({ label = "Loading your data" }: { label?: string }) {
  return (
    <div className="app-card flex min-h-48 items-center justify-center gap-3 p-6 text-sm font-bold text-[var(--muted)]">
      <Loader2 className="animate-spin text-[var(--brand)]" size={19} aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle className="text-red-700" size={24} aria-hidden="true" />
      <p className="mt-3 max-w-lg text-sm font-bold leading-6 text-red-800">{message}</p>
      {onRetry ? (
        <button className="mt-4 h-10 rounded-md border border-red-200 bg-white px-4 text-sm font-black text-red-800" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-white p-7 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
        <Inbox size={24} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-black text-[var(--ink)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const positive = ["PAID", "CAPTURED", "ACTIVE", "COMPLETED", "PRESENT", "APPROVED", "ISSUED", "SETTLED", "READY"].includes(value);
  const negative = ["FAILED", "CANCELLED", "REJECTED", "ABSENT", "REVOKED"].includes(value);
  const classes = positive
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : negative
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${classes}`}>{value.replaceAll("_", " ")}</span>;
}

export function MetricCard({
  icon,
  label,
  value,
  helper,
  href
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">{icon}</span>
      </div>
      <p className="mt-5 text-2xl font-black text-[var(--ink)]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
      {helper ? <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{helper}</p> : null}
    </>
  );

  if (href) {
    return <a className="app-card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg" href={href}>{content}</a>;
  }

  return <div className="app-card p-5">{content}</div>;
}

export function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="app-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
        <h2 className="font-black text-[var(--ink)]">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
