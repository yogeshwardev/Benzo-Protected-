"use client";

import { FileText } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "@/components/student-ui";
import { formatDate, formatMoney } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Order = { id: string; status: string; finalAmountInPaise: number; createdAt: string; course: { title: string }; invoice?: { invoiceNo: string; createdAt?: string } | null };

export default function StudentInvoicesPage() {
  const { data, error, loading, reload } = useApi<Order[]>("/orders/me");
  if (loading) return <LoadingState label="Loading invoices" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  const invoices = data?.filter((order) => order.invoice) ?? [];
  return <><PageHeading eyebrow="Billing" title="Invoices" description="An invoice record is created exactly once after a successful payment settles." />
    {!invoices.length ? <EmptyState title="No invoices yet" body="Paid course orders will generate an invoice here." /> : <section className="grid gap-4 md:grid-cols-2">{invoices.map((order) => <article key={order.id} className="border border-[var(--line)] bg-white p-5"><div className="flex items-start justify-between gap-4"><FileText className="text-[var(--brand)]" size={23}/><span className="font-mono text-xs font-bold text-[var(--muted)]">{order.invoice?.invoiceNo}</span></div><h2 className="mt-5 font-black text-[var(--ink)]">{order.course.title}</h2><div className="mt-3 flex items-center justify-between text-sm"><span className="text-[var(--muted)]">{formatDate(order.createdAt)}</span><strong>{formatMoney(order.finalAmountInPaise)}</strong></div></article>)}</section>}
  </>;
}
