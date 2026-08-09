"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ListChecks, Send } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "@/components/student-ui";
import { apiRequest, formatDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";

type Enrollment = { course: { id: string; title: string } };
type Question = { id: string; prompt: string; options: string[]; points: number };
type Attempt = { id: string; score: number; submittedAt: string; answers?: { maxScore?: number } };
type Quiz = { id: string; title: string; required: boolean; passingPercent: number; questions: Question[]; attempts: Attempt[]; courseTitle: string };

export default function StudentQuizzesPage() {
  const enrollments = useApi<Enrollment[]>("/enrollments/me");
  const [items, setItems] = useState<Quiz[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [answers, setAnswers] = useState<Record<string,Record<string,number>>>({}); const [busyId, setBusyId] = useState<string | null>(null);
  async function load() { if (!enrollments.data) return; setLoading(true); try { const groups = await Promise.all(enrollments.data.map(async (enrollment) => (await apiRequest<Omit<Quiz,"courseTitle">[]>(`/quizzes/course/${enrollment.course.id}`)).map((item) => ({ ...item, courseTitle: enrollment.course.title })))); setItems(groups.flat()); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load quizzes."); } finally { setLoading(false); } }
  useEffect(() => { if (enrollments.data) void load(); }, [enrollments.data]);
  if (enrollments.loading || loading) return <LoadingState label="Loading quizzes" />;
  if (enrollments.error || error) return <ErrorState message={enrollments.error ?? error ?? "Unable to load quizzes."} onRetry={() => window.location.reload()} />;
  async function submit(quiz: Quiz) { setBusyId(quiz.id); setError(null); try { await apiRequest(`/quizzes/${quiz.id}/attempts`, { method: "POST", body: JSON.stringify({ answers: answers[quiz.id] ?? {}, durationSeconds: 0 }) }); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Quiz submission failed."); } finally { setBusyId(null); } }
  return <><PageHeading eyebrow="Assessment" title="Quizzes" description="Choose one answer per question. BENZO grades the attempt on the server and records it against your enrollment." />
    {!items.length ? <EmptyState title="No quizzes" body="Your enrolled courses do not have published quizzes yet." /> : <section className="grid gap-5">{items.map((quiz) => { const latest = quiz.attempts[0]; const maxScore = quiz.questions.reduce((sum, question) => sum + question.points, 0); const percent = latest && maxScore ? Math.round(latest.score/maxScore*100) : null; const complete = Object.keys(answers[quiz.id] ?? {}).length === quiz.questions.length; return <article key={quiz.id} className="border border-[var(--line)] bg-white"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] bg-[#f2f5fb] p-5"><div><p className="text-xs font-black uppercase text-[var(--brand)]">{quiz.courseTitle}</p><h2 className="mt-2 text-lg font-black text-[var(--ink)]">{quiz.title}</h2><p className="mt-1 text-xs text-[var(--muted)]">Passing score {quiz.passingPercent}%</p></div>{latest ? <div className={`px-3 py-2 text-sm font-black ${Number(percent)>=quiz.passingPercent ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{percent}% · {formatDate(latest.submittedAt)}</div> : <ListChecks className="text-[var(--brand)]"/>}</div><div className="grid gap-6 p-5">{quiz.questions.map((question, questionIndex) => <fieldset key={question.id}><legend className="text-sm font-black text-[var(--ink)]">{questionIndex+1}. {question.prompt}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => { const selected = answers[quiz.id]?.[question.id] === optionIndex; return <label key={option} className={`flex cursor-pointer items-center gap-3 border p-3 text-sm ${selected ? "border-[var(--brand)] bg-[var(--brand-soft)] font-bold" : "border-[var(--line)]"}`}><input type="radio" name={`${quiz.id}-${question.id}`} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [quiz.id]: { ...(current[quiz.id] ?? {}), [question.id]: optionIndex } }))}/>{option}{selected ? <CheckCircle2 className="ml-auto text-[var(--brand)]" size={16}/> : null}</label>; })}</div></fieldset>)}</div><div className="border-t border-[var(--line)] p-5"><button className="brand-button inline-flex h-11 items-center gap-2 px-5 text-sm font-black disabled:opacity-50" disabled={!complete || busyId===quiz.id} onClick={() => void submit(quiz)}><Send size={16}/>{busyId===quiz.id ? "Submitting..." : latest ? "Submit another attempt" : "Submit quiz"}</button></div></article>; })}</section>}
  </>;
}
