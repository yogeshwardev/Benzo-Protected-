"use client";

import { Check, Copy, Gift, Share2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { formatDate, formatMoney } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type ReferralResponse = { referralCode: string; referredStudentDiscountInPaise: number; referrerCreditInPaise: number; referrals: { id: string; status: string; createdAt: string; completedAt?: string | null; referred: { user: { name: string; email: string } }; qualifyingOrder?: { finalAmountInPaise: number } | null }[] };

export default function StudentReferralsPage() {
  const { data, error, loading, reload } = useApi<ReferralResponse>("/referrals/me");
  const [copied, setCopied] = useState(false);
  if (loading) return <LoadingState label="Loading referral activity" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  async function copyCode() { if (!data) return; await navigator.clipboard.writeText(data.referralCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <><PageHeading eyebrow="Rewards" title="Referrals" description="Share your code. The new student receives a checkout discount and your wallet is credited only after their first qualifying payment succeeds." />
    <section className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-3"><div className="bg-[#17211f] p-5 text-white md:col-span-2"><p className="text-xs font-black uppercase text-white/55">Your referral code</p><div className="mt-4 flex flex-wrap items-center gap-3"><strong className="text-2xl font-black">{data?.referralCode}</strong><button className="flex h-10 items-center gap-2 border border-white/20 bg-white/10 px-3 text-sm font-black" type="button" onClick={() => void copyCode()}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy code"}</button></div></div><div className="bg-white p-5"><Gift className="text-[var(--brand)]" size={22}/><p className="mt-4 text-xl font-black">{formatMoney(data?.referrerCreditInPaise ?? 0)}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">Wallet credit per successful referral</p></div></section>
    <div className="mt-7 flex items-center gap-2"><Share2 size={18} className="text-[var(--brand)]"/><h2 className="font-black text-[var(--ink)]">Referral activity</h2></div>
    {!data?.referrals.length ? <div className="mt-4"><EmptyState title="No referrals yet" body="Share the code above. Registration alone stays pending; rewards are created after successful payment." /></div> : <div className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-white">{data.referrals.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-black text-[var(--ink)]">{item.referred.user.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.referred.user.email} · Joined {formatDate(item.createdAt)}</p></div><StatusBadge value={item.status}/></div>)}</div>}
  </>;
}
