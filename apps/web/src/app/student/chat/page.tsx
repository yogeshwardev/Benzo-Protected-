"use client";
import { getCourseImage } from "@/lib/course-catalog";
import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Send } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "@/components/student-ui";
import { apiRequest, formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = { course: { id: string; title: string } };
type Room = { id: string; title: string; course: { id: string; title: string } };
type Message = { id: string; body: string; createdAt: string; sender: { id: string; name: string; role: string } };

export default function StudentChatPage() {
  const enrollments = useApi<Enrollment[]>("/enrollments/me");
  const [courseId, setCourseId] = useState(""); const [body, setBody] = useState(""); const [busy, setBusy] = useState(false); const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => { if (!courseId && enrollments.data?.[0]) setCourseId(enrollments.data[0].course.id); }, [courseId, enrollments.data]);
  const room = useApi<Room>(courseId ? `/chat/courses/${courseId}/room` : null);
  const messages = useApi<Message[]>(room.data?.id ? `/chat/rooms/${room.data.id}/messages` : null);
  if (enrollments.loading) return <LoadingState label="Opening course chat" />;
  if (enrollments.error) return <ErrorState message={enrollments.error} onRetry={() => void enrollments.reload()} />;
  if (!enrollments.data?.length) return <><PageHeading eyebrow="Support" title="Course chat" description="Chat rooms are available only to enrolled students and their assigned instructor."/><EmptyState title="No course rooms" body="Purchase a course to join its discussion room." /></>;
  async function send(event: React.FormEvent) { event.preventDefault(); if (!room.data || !body.trim()) return; setBusy(true); setFormError(null); try { await apiRequest(`/chat/rooms/${room.data.id}/messages`, { method: "POST", body: JSON.stringify({ body: body.trim() }) }); setBody(""); await messages.reload(); } catch (caught) { setFormError(caught instanceof Error ? caught.message : "Unable to send message."); } finally { setBusy(false); } }
  return <><PageHeading eyebrow="Support" title="Course chat" description="Ask course-specific questions and keep the conversation visible to your instructor and enrolled classmates." />
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><label className="grid gap-1.5 text-sm font-black">Course<select className="field h-11 min-w-64 px-3" value={courseId} onChange={(event) => setCourseId(event.target.value)}>{enrollments.data.map((item) => <option key={item.course.id} value={item.course.id}>{item.course.title}</option>)}</select></label><button className="inline-flex h-10 items-center gap-2 border border-[var(--line)] bg-white px-3 text-sm font-black" onClick={() => void messages.reload()}><RefreshCw size={16}/> Refresh</button></div>
    <section className="border border-[var(--line)] bg-white"><div className="flex h-[52vh] min-h-96 flex-col-reverse overflow-y-auto p-4"><div className="grid gap-3">{room.loading || messages.loading ? <p className="text-sm text-[var(--muted)]">Loading messages...</p> : room.error || messages.error ? <p className="text-sm font-bold text-red-700">{room.error ?? messages.error}</p> : !messages.data?.length ? <div className="grid place-items-center py-16 text-center"><MessageCircle className="text-[var(--brand)]"/><p className="mt-3 text-sm font-bold text-[var(--muted)]">Start the course conversation.</p></div> : messages.data.map((message) => <article key={message.id} className="max-w-2xl border border-[var(--line)] bg-[#f7f9ff] p-3"><div className="flex items-center justify-between gap-4"><p className="text-xs font-black text-[var(--brand)]">{message.sender.name} · {message.sender.role}</p><time className="text-xs text-[var(--muted)]">{formatDate(message.createdAt, true)}</time></div><p className="mt-2 text-sm leading-6 text-[var(--ink)]">{message.body}</p></article>)}</div></div><form className="flex gap-2 border-t border-[var(--line)] p-4" onSubmit={(event) => void send(event)}><input className="field h-11 min-w-0 flex-1 px-3 text-sm" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a course question..." minLength={1} maxLength={2000}/><button className="brand-button grid size-11 shrink-0 place-items-center disabled:opacity-50" disabled={busy || !body.trim()} aria-label="Send message"><Send size={17}/></button></form>{formError ? <p className="border-t border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{formError}</p> : null}</section>
  </>;
}
