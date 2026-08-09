"use client";

import { ArrowRight } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { formatDate, formatMoney } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Order = {
  id: string; status: string; baseAmountInPaise: number; couponDiscountInPaise: number; referralDiscountInPaise: number; walletUsedInPaise: number; finalAmountInPaise: number; createdAt: string;
  course: { title: string; slug: string };
  payments: { id: string; status: string; providerPaymentId?: string | null; method?: string | null; capturedAt?: string | null }[];
  invoice?: { invoiceNo: string } | null;
};

export default function StudentPaymentsPage() {
  const { data, error, loading, reload } = useApi<Order[]>("/orders/me");
  if (loading) return <LoadingState label="Loading payment history" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  return <><PageHeading eyebrow="Billing" title="Payments" description="See the server-calculated price, discounts, wallet use, Razorpay result, and invoice for every order." />
    {!data?.length ? <EmptyState title="No orders yet" body="Your checkout attempts and successful payments will appear here." action={<a className="brand-button inline-flex h-11 items-center gap-2 px-5 text-sm font-black" href="/courses">Browse courses <ArrowRight size={17} /></a>} /> : (
      <div className="overflow-x-auto border border-[var(--line)] bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f2f5fb] text-xs uppercase text-[var(--muted)]"><tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Discounts</th><th className="px-4 py-3">Wallet</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment ID</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{data.map((order) => { const payment = order.payments[0]; return <tr key={order.id}><td className="px-4 py-4 font-black text-[var(--ink)]">{order.course.title}</td><td className="px-4 py-4 text-[var(--muted)]">{formatDate(order.createdAt)}</td><td className="px-4 py-4">{formatMoney(order.baseAmountInPaise)}</td><td className="px-4 py-4 text-emerald-700">−{formatMoney(order.couponDiscountInPaise + order.referralDiscountInPaise)}</td><td className="px-4 py-4">{formatMoney(order.walletUsedInPaise)}</td><td className="px-4 py-4 font-black">{formatMoney(order.finalAmountInPaise)}</td><td className="px-4 py-4"><StatusBadge value={order.status} /></td><td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{payment?.providerPaymentId ?? "—"}</td></tr>; })}</tbody></table></div>
    )}</>;
}
