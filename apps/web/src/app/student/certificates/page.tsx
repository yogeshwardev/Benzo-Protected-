"use client";

import { Award, ExternalLink } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Certificate = { id: string; verificationCode: string; status: string; issuedAt: string; course: { title: string; slug: string } };

export default function StudentCertificatesPage() {
  const { data, error, loading, reload } = useApi<Certificate[]>("/certificates/me");
  if (loading) return <LoadingState label="Loading certificates" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  return <><PageHeading eyebrow="Achievements" title="Certificates" description="Certificates are issued after course completion, required assignments and quizzes, and at least 80 percent attendance." />
    {!data?.length ? <EmptyState title="No certificates issued" body="Open an enrolled course to complete lessons and check your eligibility." /> : <section className="grid gap-5 md:grid-cols-2">{data.map((item) => <article key={item.id} className="border border-[var(--line)] bg-white p-5"><div className="flex items-start justify-between"><Award className="text-[var(--brand)]" size={28}/><StatusBadge value={item.status}/></div><h2 className="mt-6 text-xl font-black text-[var(--ink)]">{item.course.title}</h2><p className="mt-2 font-mono text-xs text-[var(--muted)]">{item.verificationCode}</p><p className="mt-4 text-sm text-[var(--muted)]">Issued {formatDate(item.issuedAt)}</p><a className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]" href={`/verify/${item.verificationCode}`}>Verify certificate <ExternalLink size={15}/></a></article>)}</section>}
  </>;
}
