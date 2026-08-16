"use client";
import { getCourseImage } from "@/lib/course-catalog";
import { useEffect, useState } from "react";
import { ClipboardCheck, ExternalLink, Send } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { apiRequest, formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = {
  course: {
    id: string;
    title: string;
    slug: string;
  };
};
type Submission = { id: string; submissionUrl: string; status: string; feedback?: string | null; submittedAt: string };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueAt?: string | null;
  required: boolean;
  submissions: Submission[];
  courseTitle: string;
  courseSlug: string;
};

export default function StudentAssignmentsPage() {
  const enrollments = useApi<Enrollment[]>("/enrollments/me");
  const [items, setItems] = useState<Assignment[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [links, setLinks] = useState<Record<string,string>>({}); const [busyId, setBusyId] = useState<string | null>(null);
  async function load() { if (!enrollments.data) return; setLoading(true); setError(null); try { const groups = await Promise.all(enrollments.data.map(async (enrollment) => (await apiRequest<Omit<Assignment,"courseTitle">[]>(`/assignments/course/${enrollment.course.id}`)).map((item) => ({
  ...item,
  courseTitle: enrollment.course.title,
  courseSlug: enrollment.course.slug,
})))); setItems(groups.flat()); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load assignments."); } finally { setLoading(false); } }
  useEffect(() => { if (enrollments.data) void load(); }, [enrollments.data]);
  if (enrollments.loading || loading) return <LoadingState label="Loading assignments" />;
  if (enrollments.error || error) return <ErrorState message={enrollments.error ?? error ?? "Unable to load assignments."} onRetry={() => window.location.reload()} />;
  async function submit(assignmentId: string) { const url = links[assignmentId]?.trim(); if (!url) return; setBusyId(assignmentId); setError(null); try { await apiRequest(`/assignments/${assignmentId}/submissions`, { method: "POST", body: JSON.stringify({ submissionUrl: url }) }); setLinks((current) => ({ ...current, [assignmentId]: "" })); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Submission failed."); } finally { setBusyId(null); } }
  return <><PageHeading eyebrow="Coursework" title="Assignments" description="Submit a repository, document, or storage link. Instructor review and feedback stay attached to your enrollment." />
    {!items.length ? <EmptyState title="No assignments" body="Your enrolled courses do not have published assignments yet." /> : <section className="grid gap-5 lg:grid-cols-2">{items.map((item) => { const latest = item.submissions[0]; const canSubmit = !latest || ["REJECTED","RESUBMISSION_REQUIRED"].includes(latest.status); return <article key={item.id} className="border border-[var(--line)] bg-white p-5"><div className="flex items-start justify-between gap-4"><img
  src={getCourseImage(item.courseSlug)}
  alt={item.courseTitle}
  className="h-14 w-14 object-contain"
/>{latest ? <StatusBadge value={latest.status}/> : <span className="text-xs font-black text-amber-800">NOT SUBMITTED</span>}</div><p className="mt-4 text-xs font-black uppercase text-[var(--accent)]">{item.courseTitle}</p><h2 className="mt-2 text-lg font-black text-[var(--ink)]">{item.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>{item.dueAt ? <p className="mt-3 text-xs font-bold text-[var(--muted)]">Due {formatDate(item.dueAt, true)}</p> : null}{latest ? <div className="mt-4 border-l-2 border-[var(--brand)] bg-[#f7fbfa] p-3 text-sm"><a className="inline-flex items-center gap-1 font-black text-[var(--brand)]" href={latest.submissionUrl} target="_blank" rel="noreferrer">Open submission <ExternalLink size={14}/></a>{latest.feedback ? <p className="mt-2 text-[var(--muted)]">Feedback: {latest.feedback}</p> : null}</div> : null}{canSubmit ? <div className="mt-4 flex gap-2"><input className="field h-11 min-w-0 flex-1 px-3 text-sm" type="url" placeholder="https://github.com/..." value={links[item.id] ?? ""} onChange={(event) => setLinks((current) => ({ ...current, [item.id]: event.target.value }))}/><button className="brand-button grid size-11 shrink-0 place-items-center disabled:opacity-50" type="button" aria-label="Submit assignment" disabled={busyId === item.id || !links[item.id]?.trim()} onClick={() => void submit(item.id)}><Send size={17}/></button></div> : null}</article>; })}</section>}
  </>;
}
