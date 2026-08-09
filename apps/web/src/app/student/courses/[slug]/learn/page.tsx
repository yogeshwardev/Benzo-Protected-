"use client";

import { use } from "react";
import { CheckCircle2, Clock3, FileText, PlayCircle, Video } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { apiRequest, formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = { id: string; course: { id: string; title: string; slug: string; shortDesc: string } };
type Lesson = { id: string; title: string; description?: string | null; durationSeconds?: number | null; materials: { id: string; title: string; mimeType: string }[]; recordings: { id: string; status: string; durationSeconds?: number | null }[] };
type Outline = { id: string; title: string; modules: { id: string; title: string; description?: string | null; lessons: Lesson[] }[]; lessons: Lesson[] };
type Progress = { lessonCount: number; completedCount: number; completionPercent: number; progress: { lesson: { id: string }; completed: boolean; progressPercent: number }[] };
type LiveClass = { id: string; title: string; startsAt: string; endsAt: string; status: string };

export default function StudentCourseLearningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const enrollments = useApi<Enrollment[]>("/enrollments/me");
  const enrollment = enrollments.data?.find((item) => item.course.slug === slug);
  const courseId = enrollment?.course.id ?? null;
  const outline = useApi<Outline>(courseId ? `/learning/courses/${courseId}/outline` : null);
  const progress = useApi<Progress>(courseId ? `/learning/courses/${courseId}/progress` : null);
  const classes = useApi<LiveClass[]>(courseId ? `/live-classes/course/${courseId}` : null);
  const loading = enrollments.loading || (courseId ? outline.loading || progress.loading || classes.loading : false);
  const error = enrollments.error || outline.error || progress.error || classes.error;
  if (loading) return <LoadingState label="Opening your course" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!enrollment) return <EmptyState title="Enrollment required" body="This course is not active on your student account." action={<a className="brand-button inline-flex h-11 items-center px-5 text-sm font-black" href={`/courses/${slug}`}>View course</a>} />;

  const completedIds = new Set(progress.data?.progress.filter((item) => item.completed).map((item) => item.lesson.id));
  const modules = [...(outline.data?.modules ?? []), ...(outline.data?.lessons.length ? [{ id: "other", title: "More lessons", lessons: outline.data.lessons }] : [])];
  async function toggleLesson(lessonId: string, completed: boolean) { await apiRequest(`/learning/lessons/${lessonId}/progress`, { method: "PATCH", body: JSON.stringify({ completed, progressPercent: completed ? 100 : 0, lastPositionSeconds: 0 }) }); await progress.reload(); }

  return <><a className="text-sm font-black text-[var(--brand)]" href="/student/courses">Back to my courses</a><div className="mt-6"><PageHeading eyebrow="Course workspace" title={enrollment.course.title} description={enrollment.course.shortDesc} /></div>
    <section className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3"><Metric label="Lessons" value={`${progress.data?.completedCount ?? 0}/${progress.data?.lessonCount ?? 0}`} /><Metric label="Course progress" value={`${progress.data?.completionPercent ?? 0}%`} /><Metric label="Upcoming classes" value={String(classes.data?.filter((item) => new Date(item.startsAt) > new Date() && item.status !== "CANCELLED").length ?? 0)} /></section>
    <div className="mt-2 h-2 bg-slate-200"><div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${progress.data?.completionPercent ?? 0}%` }} /></div>
    <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_340px]"><div className="grid gap-4">{modules.length ? modules.map((module) => <article key={module.id} className="border border-[var(--line)] bg-white"><div className="border-b border-[var(--line)] bg-[#f2f5fb] px-5 py-4"><h2 className="font-black text-[var(--ink)]">{module.title}</h2>{"description" in module && module.description ? <p className="mt-1 text-xs text-[var(--muted)]">{module.description}</p> : null}</div><div className="divide-y divide-[var(--line)]">{module.lessons.map((lesson) => { const done = completedIds.has(lesson.id); return <div key={lesson.id} className="p-5"><div className="flex items-start gap-4"><button className={`grid size-9 shrink-0 place-items-center border ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-[var(--line)] bg-white text-slate-400"}`} type="button" aria-label={done ? "Mark lesson incomplete" : "Mark lesson complete"} onClick={() => void toggleLesson(lesson.id, !done)}><CheckCircle2 size={18}/></button><div className="min-w-0 flex-1"><h3 className="font-black text-[var(--ink)]">{lesson.title}</h3>{lesson.description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{lesson.description}</p> : null}<div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[var(--muted)]">{lesson.durationSeconds ? <span className="flex items-center gap-1"><Clock3 size={14}/>{Math.ceil(lesson.durationSeconds/60)} min</span> : null}{lesson.materials.map((material) => <span key={material.id} className="flex items-center gap-1"><FileText size={14}/>{material.title}</span>)}{lesson.recordings.map((recording) => <span key={recording.id} className="flex items-center gap-1"><PlayCircle size={14}/>Recording: {recording.status}</span>)}</div></div></div></div>; })}</div></article>) : <EmptyState title="Course content is being prepared" body="Your enrollment is active. The instructor has not published lessons yet." />}</div>
      <aside><h2 className="font-black text-[var(--ink)]">Live classes</h2><div className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] bg-white">{classes.data?.length ? classes.data.slice(0,8).map((item) => <div key={item.id} className="p-4"><div className="flex items-start justify-between gap-3"><Video className="text-[var(--brand)]" size={19}/><StatusBadge value={item.status}/></div><p className="mt-3 text-sm font-black text-[var(--ink)]">{item.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{formatDate(item.startsAt, true)}</p><a className="mt-3 inline-flex text-xs font-black text-[var(--brand)]" href={`/student/live/${item.id}`}>Open classroom</a></div>) : <p className="p-4 text-sm leading-6 text-[var(--muted)]">No classes scheduled yet.</p>}</div><div className="mt-5 grid grid-cols-2 gap-3"><a className="border border-[var(--line)] bg-white p-3 text-center text-xs font-black" href="/student/assignments">Assignments</a><a className="border border-[var(--line)] bg-white p-3 text-center text-xs font-black" href="/student/quizzes">Quizzes</a><a className="border border-[var(--line)] bg-white p-3 text-center text-xs font-black" href="/student/chat">Course chat</a><a className="border border-[var(--line)] bg-white p-3 text-center text-xs font-black" href="/student/certificates">Certificate</a></div></aside>
    </section></>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="bg-white p-4"><p className="text-xl font-black text-[var(--ink)]">{value}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p></div>; }
