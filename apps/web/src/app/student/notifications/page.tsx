"use client";

import { Bell, CheckCheck } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "@/components/student-ui";
import { apiRequest, formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Notification = { id: string; title: string; body: string; type: string; linkUrl?: string | null; readAt?: string | null; createdAt: string };

export default function StudentNotificationsPage() {
  const { data, error, loading, reload } = useApi<Notification[]>("/notifications/me");
  if (loading) return <LoadingState label="Loading notifications" />;
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />;
  async function readOne(id: string) { await apiRequest(`/notifications/${id}/read`, { method: "PATCH" }); await reload(); }
  async function readAll() { await apiRequest("/notifications/me/read-all", { method: "PATCH" }); await reload(); }
  return <><div className="flex flex-wrap items-start justify-between gap-4"><PageHeading eyebrow="Inbox" title="Notifications" description="Course announcements, payment events, and certificate updates appear here." />{data?.some((item) => !item.readAt) ? <button className="inline-flex h-10 items-center gap-2 border border-[var(--line)] bg-white px-4 text-sm font-black" onClick={() => void readAll()}><CheckCheck size={17}/> Mark all read</button> : null}</div>
    {!data?.length ? <EmptyState title="Inbox is clear" body="New BENZO announcements and account activity will appear here." /> : <div className="divide-y divide-[var(--line)] border border-[var(--line)] bg-white">{data.map((item) => <article key={item.id} className={`flex gap-4 p-4 ${item.readAt ? "opacity-65" : "bg-[#f7f9ff]"}`}><span className="grid size-10 shrink-0 place-items-center bg-[var(--brand-soft)] text-[var(--brand)]"><Bell size={18}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-black text-[var(--ink)]">{item.title}</h2><time className="text-xs text-[var(--muted)]">{formatDate(item.createdAt, true)}</time></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p><div className="mt-3 flex gap-4">{item.linkUrl ? <a className="text-xs font-black text-[var(--brand)]" href={item.linkUrl}>Open</a> : null}{!item.readAt ? <button className="text-xs font-black text-[var(--brand)]" onClick={() => void readOne(item.id)}>Mark read</button> : null}</div></div></article>)}</div>}
  </>;
}
