"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  BadgeCheck,
  Ban,
  Check,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  X
} from "lucide-react";
import { ErrorState, LoadingState, PageHeading, StatusBadge } from "@/components/student-ui";
import { apiRequest, formatDate, formatMoney, getSession } from "@/lib/api";
import { apiBaseUrl } from "@/lib/auth";
import { useApi } from "@/lib/use-api";

export type AdminView =
  | "dashboard"
  | "students"
  | "instructors"
  | "courses"
  | "enrollments"
  | "academics"
  | "learning"
  | "live-classes"
  | "attendance"
  | "payments"
  | "financial"
  | "coupons"
  | "referrals"
  | "withdrawals"
  | "salaries"
  | "certificates"
  | "chat"
  | "announcements"
  | "audit-logs"
  | "admins";

type Course = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  difficulty: string;
  priceInPaise: number;
  published: boolean;
  schedules: Array<{ id: string; dayOfWeek: number; startMinute: number; endMinute: number; timezone: string }>;
  assignments: Array<{ instructor: { id: string; user: { id: string; name: string; email: string; status: string } } }>;
  _count: { enrollments: number; lessons: number; materials: number; quizzes: number; liveClasses: number };
};
type Student = { id: string; studentCode: string; referralCode: string; createdAt: string; user: UserSummary };
type UserSummary = { id: string; name: string; email: string; mobile?: string | null; role?: string; status: string; createdAt?: string };
type Instructor = {
  id: string;
  instructorCode: string;
  qualification: string;
  perClassSalary: number;
  user: UserSummary;
  assignments: Array<{ course: Pick<Course, "id" | "title" | "slug"> }>;
};
type FinancialSummary = {
  grossSalesInPaise: number;
  totalDiscountsInPaise: number;
  couponDiscountsInPaise: number;
  referralDiscountsInPaise: number;
  walletUsedInPaise: number;
  refundsInPaise: number;
  netRevenueInPaise: number;
  successfulPayments: number;
  failedPayments: number;
};
type PaymentOrder = {
  id: string;
  status: string;
  baseAmountInPaise: number;
  couponDiscountInPaise: number;
  referralDiscountInPaise: number;
  walletUsedInPaise: number;
  finalAmountInPaise: number;
  createdAt: string;
  student: { id: string; user: UserSummary };
  course: { title: string; slug: string };
  payments: Array<{ providerPaymentId?: string | null; status: string }>;
  coupon?: { code: string } | null;
};

const tableClass = "w-full min-w-[760px] text-left text-sm";
const thClass = "px-4 py-3 text-xs font-black uppercase text-[var(--muted)]";
const tdClass = "px-4 py-3 align-top";
const buttonClass = "inline-flex h-9 items-center justify-center gap-2 rounded border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--ink)] disabled:opacity-40";
const primaryButtonClass = "inline-flex h-10 items-center justify-center gap-2 rounded bg-[var(--brand)] px-4 text-sm font-black text-white disabled:opacity-50";

export function AdminWorkspace({ view }: { view: AdminView }) {
  if (view === "dashboard") return <AdminDashboard />;
  if (view === "students") return <StudentsPage />;
  if (view === "instructors") return <InstructorsPage />;
  if (view === "courses") return <CoursesPage />;
  if (view === "enrollments") return <EnrollmentsPage />;
  if (view === "academics") return <AcademicsPage />;
  if (view === "learning") return <LearningPage />;
  if (view === "live-classes") return <LiveClassesPage />;
  if (view === "attendance") return <AttendancePage />;
  if (view === "payments" || view === "financial") return <FinancialPage paymentsOnly={view === "payments"} />;
  if (view === "coupons") return <CouponsPage />;
  if (view === "referrals") return <ReferralsPage />;
  if (view === "withdrawals") return <WithdrawalsPage />;
  if (view === "salaries") return <SalariesPage />;
  if (view === "certificates") return <CertificatesPage />;
  if (view === "chat") return <ChatPage />;
  if (view === "announcements") return <AnnouncementsPage />;
  if (view === "audit-logs") return <AuditLogsPage />;
  return <AdminsPage />;
}

function AdminDashboard() {
  const summary = useApi<FinancialSummary>("/financial/summary?preset=last30");
  const courses = useApi<Course[]>("/courses/admin/all");
  const students = useApi<Student[]>("/students");
  const instructors = useApi<Instructor[]>("/instructors");
  const withdrawals = useApi<Array<{ status: string }>>("/withdrawals/admin/all");
  const loading = summary.loading || courses.loading || students.loading || instructors.loading || withdrawals.loading;
  const error = summary.error || courses.error || students.error || instructors.error || withdrawals.error;
  const reload = async () => Promise.all([summary.reload(), courses.reload(), students.reload(), instructors.reload(), withdrawals.reload()]);

  return <>
    <PageHeading eyebrow="Operations" title="Admin dashboard" description="Live platform totals and queues from BENZO APIs." />
    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void reload()} /> : <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Net revenue (30d)" value={formatMoney(summary.data?.netRevenueInPaise ?? 0)} />
        <Metric label="Paid orders" value={String(summary.data?.successfulPayments ?? 0)} />
        <Metric label="Students" value={String(students.data?.length ?? 0)} />
        <Metric label="Instructors" value={String(instructors.data?.length ?? 0)} />
        <Metric label="Published courses" value={String(courses.data?.filter((course) => course.published).length ?? 0)} />
      </section>
      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Pending work">
          <QueueLine label="Withdrawal requests" value={withdrawals.data?.filter((item) => item.status === "PENDING").length ?? 0} href="/admin/withdrawals" />
          <QueueLine label="Unpublished courses" value={courses.data?.filter((course) => !course.published).length ?? 0} href="/admin/courses" />
          <QueueLine label="Suspended students" value={students.data?.filter((student) => student.user.status === "SUSPENDED").length ?? 0} href="/admin/students" />
        </Panel>
        <Panel title="Financial snapshot">
          <QueueLine label="Gross sales" value={formatMoney(summary.data?.grossSalesInPaise ?? 0)} href="/admin/financial" />
          <QueueLine label="Discounts and wallet" value={formatMoney(summary.data?.totalDiscountsInPaise ?? 0)} href="/admin/financial" />
          <QueueLine label="Failed payments" value={summary.data?.failedPayments ?? 0} href="/admin/payments" />
        </Panel>
      </section>
    </>}
  </>;
}

function StudentsPage() {
  const students = useApi<Student[]>("/students");
  const action = useAction(students.reload);
  async function changeStatus(student: Student) {
    const status = student.user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    await action.run(() => apiRequest(`/users/${student.user.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }), `Student ${status === "ACTIVE" ? "reactivated" : "suspended"}.`);
  }
  return <>
    <PageHeading eyebrow="People" title="Students" description="View registered learners and suspend or reactivate account access." />
    <ActionNotice action={action} />
    <DataState query={students}>{(data) => <Table headers={["Student", "Contact", "Referral", "Joined", "Status", "Action"]}>{data.map((student) => <tr key={student.id} className="border-t border-[var(--line)]">
      <td className={tdClass}><strong>{student.user.name}</strong><p className="text-xs text-[var(--muted)]">{student.studentCode}</p></td>
      <td className={tdClass}>{student.user.email}<p className="text-xs text-[var(--muted)]">{student.user.mobile ?? "No mobile"}</p></td>
      <td className={`${tdClass} font-mono text-xs`}>{student.referralCode}</td>
      <td className={tdClass}>{formatDate(student.createdAt)}</td><td className={tdClass}><StatusBadge value={student.user.status} /></td>
      <td className={tdClass}><button className={buttonClass} onClick={() => void changeStatus(student)} disabled={action.busy}>{student.user.status === "SUSPENDED" ? <Check size={15} /> : <Ban size={15} />}{student.user.status === "SUSPENDED" ? "Reactivate" : "Suspend"}</button></td>
    </tr>)}</Table>}</DataState>
  </>;
}

function InstructorsPage() {
  const instructors = useApi<Instructor[]>("/instructors");
  const courses = useApi<Course[]>("/courses/admin/all");
  const action = useAction(async () => Promise.all([instructors.reload(), courses.reload()]));
  const [formOpen, setFormOpen] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await action.run(() => apiRequest("/instructors", { method: "POST", body: JSON.stringify({
      name: form.get("name"), email: form.get("email"), mobile: form.get("mobile"), qualification: form.get("qualification"), courseId: form.get("courseId"),
      perClassSalaryInPaise: Math.round(Number(form.get("salary")) * 100), joiningDate: form.get("joiningDate"), bankMasked: form.get("bankMasked") || undefined, temporaryPassword: form.get("password")
    }) }), "Instructor account created and activated.");
    if (!action.error) setFormOpen(false);
  }
  async function changeStatus(item: Instructor) {
    const status = item.user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    await action.run(() => apiRequest(`/users/${item.user.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }), "Instructor status updated.");
  }
  return <>
    <HeadingAction eyebrow="People" title="Instructors" description="Create instructor accounts, bind one active course, and control access." label="New instructor" onClick={() => setFormOpen(!formOpen)} />
    {formOpen ? <FormPanel title="Create instructor" onClose={() => setFormOpen(false)}><form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void create(event)}>
      <Field name="name" label="Full name" required /><Field name="email" label="Email" type="email" required /><Field name="mobile" label="Mobile" required minLength={8} /><Field name="qualification" label="Qualification" required />
      <SelectField name="courseId" label="Unassigned course" required options={(courses.data ?? []).filter((course) => !course.assignments.length).map((course) => [course.id, course.title])} />
      <Field name="salary" label="Salary per class (INR)" type="number" min="1" required /><Field name="joiningDate" label="Joining date" type="date" required /><Field name="bankMasked" label="Masked bank account" placeholder="XXXX4321" />
      <Field name="password" label="Temporary password" type="password" minLength={8} required /><SubmitButton busy={action.busy} label="Create instructor" />
    </form></FormPanel> : null}
    <ActionNotice action={action} />
    <DataState query={instructors}>{(data) => <Table headers={["Instructor", "Qualification", "Course", "Per class", "Status", "Action"]}>{data.map((item) => <tr key={item.id} className="border-t border-[var(--line)]">
      <td className={tdClass}><strong>{item.user.name}</strong><p className="text-xs text-[var(--muted)]">{item.user.email}</p></td><td className={tdClass}>{item.qualification}</td>
      <td className={tdClass}>{item.assignments[0]?.course.title ?? "Unassigned"}</td><td className={tdClass}>{formatMoney(item.perClassSalary)}</td><td className={tdClass}><StatusBadge value={item.user.status} /></td>
      <td className={tdClass}><button className={buttonClass} onClick={() => void changeStatus(item)} disabled={action.busy}>{item.user.status === "SUSPENDED" ? "Reactivate" : "Suspend"}</button></td>
    </tr>)}</Table>}</DataState>
  </>;
}

function CoursesPage() {
  const courses = useApi<Course[]>("/courses/admin/all"); const action = useAction(courses.reload); const [formOpen, setFormOpen] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const start = timeToMinute(String(form.get("startTime"))); const end = timeToMinute(String(form.get("endTime")));
    await action.run(() => apiRequest("/courses", { method: "POST", body: JSON.stringify({ title: form.get("title"), slug: form.get("slug"), shortDescription: form.get("shortDescription"), fullDescription: form.get("fullDescription"), category: form.get("category"), difficulty: form.get("difficulty"), priceInPaise: Math.round(Number(form.get("price")) * 100), requirements: lines(form.get("requirements")), outcomes: lines(form.get("outcomes")), published: form.get("published") === "on", schedule: { dayOfWeek: Number(form.get("day")), startMinute: start, endMinute: end, timezone: "Asia/Kolkata" } }) }), "Course created."); }
  async function updateCourse(id: string, payload: object, message: string) { await action.run(() => apiRequest(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(payload) }), message); }
  return <>
    <HeadingAction eyebrow="Catalog" title="Courses" description="Create courses, edit future pricing, schedules, and publication." label="New course" onClick={() => setFormOpen(!formOpen)} />
    {formOpen ? <FormPanel title="Create course" onClose={() => setFormOpen(false)}><form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void create(event)}>
      <Field name="title" label="Title" required /><Field name="slug" label="URL slug" required /><Field name="category" label="Category" required />
      <SelectField name="difficulty" label="Difficulty" required options={[["BEGINNER","Beginner"],["INTERMEDIATE","Intermediate"],["ADVANCED","Advanced"]]} />
      <Field name="price" label="Price (INR)" type="number" min="1" defaultValue="699" required /><SelectField name="day" label="Class day" required options={[["1","Monday"],["2","Tuesday"],["3","Wednesday"],["4","Thursday"],["5","Friday"],["6","Saturday"]]} />
      <Field name="startTime" label="Start time" type="time" defaultValue="19:00" required /><Field name="endTime" label="End time" type="time" defaultValue="20:00" required />
      <TextArea name="shortDescription" label="Short description" required /><TextArea name="fullDescription" label="Full description" required />
      <TextArea name="requirements" label="Requirements (one per line)" required /><TextArea name="outcomes" label="Outcomes (one per line)" required />
      <label className="flex items-center gap-2 text-sm font-bold"><input name="published" type="checkbox" /> Publish immediately</label><SubmitButton busy={action.busy} label="Create course" />
    </form></FormPanel> : null}<ActionNotice action={action} />
    <DataState query={courses}>{(data) => <Table headers={["Course", "Instructor", "Students", "Content", "Price", "Status"]}>{data.map((course) => <tr key={course.id} className="border-t border-[var(--line)]">
      <td className={tdClass}><strong>{course.title}</strong><p className="text-xs text-[var(--muted)]">{course.category} | {course.difficulty}</p></td><td className={tdClass}>{course.assignments[0]?.instructor.user.name ?? "Unassigned"}</td><td className={tdClass}>{course._count.enrollments}</td><td className={tdClass}>{course._count.lessons} lessons</td>
      <td className={tdClass}><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get("price"); void updateCourse(course.id, { priceInPaise: Math.round(Number(value) * 100) }, "Course price updated."); }}><input className="field h-9 w-24 rounded px-2" name="price" type="number" min="1" defaultValue={course.priceInPaise / 100} /><button className={buttonClass}>Save</button></form></td>
      <td className={tdClass}><button className={buttonClass} onClick={() => void updateCourse(course.id, { published: !course.published }, course.published ? "Course unpublished." : "Course published.")}><StatusBadge value={course.published ? "ACTIVE" : "DRAFT"} /></button></td>
    </tr>)}</Table>}</DataState>
  </>;
}

function EnrollmentsPage() {
  const courses = useApi<Course[]>("/courses/admin/all"); const [courseId, setCourseId] = useState("");
  useEffect(() => { if (!courseId && courses.data?.[0]) setCourseId(courses.data[0].id); }, [courseId, courses.data]);
  type Enrollment = { id: string; active: boolean; enrolledAt: string; student: { user: UserSummary } };
  const enrollments = useApi<Enrollment[]>(courseId ? `/enrollments/course/${courseId}` : null); const action = useAction(enrollments.reload);
  async function toggle(item: Enrollment) { await action.run(() => apiRequest(`/enrollments/${item.id}/access`, { method: "PATCH", body: JSON.stringify({ active: !item.active }) }), item.active ? "Course access removed." : "Course access restored."); }
  return <><PageHeading eyebrow="Access" title="Course enrollments" description="Review rosters and immediately remove or restore course access without deleting payment history." />
    <CoursePicker courses={courses.data ?? []} value={courseId} onChange={setCourseId} /><ActionNotice action={action} />
    <DataState query={enrollments}>{(data) => <Table headers={["Student", "Email", "Enrolled", "Access", "Action"]}>{data.map((item) => <tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{item.student.user.name}</strong></td><td className={tdClass}>{item.student.user.email}</td><td className={tdClass}>{formatDate(item.enrolledAt)}</td><td className={tdClass}><StatusBadge value={item.active ? "ACTIVE" : "SUSPENDED"} /></td><td className={tdClass}><button className={buttonClass} onClick={() => void toggle(item)}>{item.active ? "Remove access" : "Restore access"}</button></td></tr>)}</Table>}</DataState>
  </>;
}

function AcademicsPage() {
  const courses = useApi<Course[]>("/courses/admin/all"); const [courseId, setCourseId] = useState("");
  useEffect(() => { if (!courseId && courses.data?.[0]) setCourseId(courses.data[0].id); }, [courseId, courses.data]);
  const assignments = useApi<Array<{ id: string; title: string; dueAt?: string; required: boolean }>>(courseId ? `/assignments/course/${courseId}` : null);
  const quizzes = useApi<Array<{ id: string; title: string; required: boolean; passingPercent: number; questions: unknown[] }>>(courseId ? `/quizzes/course/${courseId}` : null);
  return <><PageHeading eyebrow="Learning" title="Academic overview" description="Monitor assignments and quizzes created for each course." /><CoursePicker courses={courses.data ?? []} value={courseId} onChange={setCourseId} />
    <section className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Assignments"><DataState query={assignments}>{(data) => data.length ? <div className="divide-y divide-[var(--line)]">{data.map((item) => <div className="py-3" key={item.id}><strong>{item.title}</strong><p className="text-xs text-[var(--muted)]">{item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No deadline"} | {item.required ? "Required" : "Optional"}</p></div>)}</div> : <Empty label="No assignments" />}</DataState></Panel>
    <Panel title="Quizzes"><DataState query={quizzes}>{(data) => data.length ? <div className="divide-y divide-[var(--line)]">{data.map((item) => <div className="py-3" key={item.id}><strong>{item.title}</strong><p className="text-xs text-[var(--muted)]">{item.questions.length} questions | Pass {item.passingPercent}%</p></div>)}</div> : <Empty label="No quizzes" />}</DataState></Panel></section>
  </>;
}

function LearningPage() {
  const courses = useApi<Course[]>("/courses/admin/all"); const [courseId, setCourseId] = useState(""); useEffect(() => { if (!courseId && courses.data?.[0]) setCourseId(courses.data[0].id); }, [courseId, courses.data]);
  type Lesson = { id: string; title: string; position: number }; type Outline = { id: string; title: string; modules: Array<{ id: string; title: string; position: number; lessons: Lesson[] }>; lessons: Lesson[] };
  const outline = useApi<Outline>(courseId ? `/learning/courses/${courseId}/outline` : null); const action = useAction(outline.reload);
  async function createModule(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); await action.run(() => apiRequest("/learning/modules", { method: "POST", body: JSON.stringify({ courseId, title: f.get("title"), description: f.get("description") || undefined, position: Number(f.get("position")) }) }), "Module created."); }
  async function createLesson(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); await action.run(() => apiRequest("/learning/lessons", { method: "POST", body: JSON.stringify({ courseId, moduleId: f.get("moduleId") || undefined, title: f.get("title"), description: f.get("description") || undefined, content: f.get("content") || undefined, position: Number(f.get("position")), durationSeconds: Number(f.get("duration")) * 60 }) }), "Lesson created."); }
  return <><PageHeading eyebrow="Content" title="Learning structure" description="Create ordered course modules and lessons with real API persistence." /><CoursePicker courses={courses.data ?? []} value={courseId} onChange={setCourseId} /><ActionNotice action={action} />
    <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.2fr]"><div className="grid gap-4"><FormPanel title="New module"><form className="grid gap-3" onSubmit={(event) => void createModule(event)}><Field name="title" label="Module title" required /><Field name="description" label="Description" /><Field name="position" label="Position" type="number" min="1" defaultValue="1" required /><SubmitButton busy={action.busy} label="Create module" /></form></FormPanel>
      <FormPanel title="New lesson"><form className="grid gap-3" onSubmit={(event) => void createLesson(event)}><SelectField name="moduleId" label="Module" options={[["","No module"],...(outline.data?.modules ?? []).map((item) => [item.id,item.title])]} /><Field name="title" label="Lesson title" required /><Field name="description" label="Description" /><TextArea name="content" label="Lesson content" /><div className="grid grid-cols-2 gap-3"><Field name="position" label="Position" type="number" min="1" defaultValue="1" required /><Field name="duration" label="Minutes" type="number" min="1" defaultValue="30" required /></div><SubmitButton busy={action.busy} label="Create lesson" /></form></FormPanel></div>
      <Panel title={outline.data?.title ?? "Course outline"}><DataState query={outline}>{(data) => <div className="grid gap-3">{data.modules.map((module) => <section key={module.id} className="border-l-2 border-[var(--brand)] pl-4"><strong>{module.position}. {module.title}</strong><div className="mt-2 grid gap-2">{module.lessons.map((lesson) => <p className="text-sm text-[var(--muted)]" key={lesson.id}>{lesson.position}. {lesson.title}</p>)}{!module.lessons.length ? <p className="text-sm text-[var(--muted)]">No lessons yet.</p> : null}</div></section>)}{data.lessons.map((lesson) => <p className="text-sm" key={lesson.id}>{lesson.position}. {lesson.title}</p>)}</div>}</DataState></Panel></section>
  </>;
}

function LiveClassesPage() {
  const courses = useApi<Course[]>("/courses/admin/all"); const [courseId, setCourseId] = useState(""); useEffect(() => { if (!courseId && courses.data?.[0]) setCourseId(courses.data[0].id); }, [courseId, courses.data]);
  type LiveClass = { id: string; title: string; startsAt: string; endsAt: string; status: string };
  const classes = useApi<LiveClass[]>(courseId ? `/live-classes/course/${courseId}` : null); const action = useAction(classes.reload);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); await action.run(() => apiRequest("/live-classes", { method: "POST", body: JSON.stringify({ courseId, title: f.get("title"), startsAt: new Date(String(f.get("startsAt"))).toISOString(), endsAt: new Date(String(f.get("endsAt"))).toISOString() }) }), "Live class scheduled."); }
  async function setStatus(id: string, status: string) { await action.run(() => apiRequest(`/live-classes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }), `Class marked ${status.toLowerCase()}.`); }
  return <><PageHeading eyebrow="Schedule" title="Live classes" description="Schedule classes, cancel or reschedule operational status, and monitor delivery." /><CoursePicker courses={courses.data ?? []} value={courseId} onChange={setCourseId} /><ActionNotice action={action} />
    <FormPanel title="Schedule live class"><form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => void create(event)}><Field name="title" label="Class title" required /><Field name="startsAt" label="Starts" type="datetime-local" required /><Field name="endsAt" label="Ends" type="datetime-local" required /><SubmitButton busy={action.busy} label="Schedule class" /></form></FormPanel>
    <div className="mt-4"><DataState query={classes}>{(data) => <Table headers={["Class", "Start", "End", "Status", "Actions"]}>{data.map((item) => <tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{item.title}</strong></td><td className={tdClass}>{formatDate(item.startsAt,true)}</td><td className={tdClass}>{formatDate(item.endsAt,true)}</td><td className={tdClass}><StatusBadge value={item.status} /></td><td className={`${tdClass} flex flex-wrap gap-2`}>{item.status === "SCHEDULED" ? <><button className={buttonClass} onClick={() => void setStatus(item.id,"LIVE")}>Start</button><button className={buttonClass} onClick={() => void setStatus(item.id,"CANCELLED")}>Cancel</button></> : null}{item.status === "LIVE" ? <button className={buttonClass} onClick={() => void setStatus(item.id,"COMPLETED")}>Complete</button> : null}</td></tr>)}</Table>}</DataState></div>
  </>;
}

function AttendancePage() {
  type Row = { id: string; attendedSeconds: number; scheduledSeconds: number; percent: number; state: string; calculatedAt: string; liveClass: { title: string; course: { title: string; assignments: Array<{ instructor: { user: UserSummary } }> } } };
  const query = useApi<Row[]>("/salary/admin/attendance");
  return <><PageHeading eyebrow="Teaching" title="Instructor attendance" description="Official connected duration and salary attendance signal for every summarized class." /><DataState query={query}>{(data) => <Table headers={["Instructor", "Course / class", "Duration", "Percent", "State", "Calculated"]}>{data.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className={tdClass}>{row.liveClass.course.assignments[0]?.instructor.user.name ?? "Unassigned"}</td><td className={tdClass}><strong>{row.liveClass.course.title}</strong><p className="text-xs text-[var(--muted)]">{row.liveClass.title}</p></td><td className={tdClass}>{Math.round(row.attendedSeconds/60)} / {Math.round(row.scheduledSeconds/60)} min</td><td className={tdClass}>{row.percent}%</td><td className={tdClass}><StatusBadge value={row.state} /></td><td className={tdClass}>{formatDate(row.calculatedAt,true)}</td></tr>)}</Table>}</DataState></>;
}

function FinancialPage({ paymentsOnly }: { paymentsOnly: boolean }) {
  const [preset, setPreset] = useState("last30"); const summary = useApi<FinancialSummary>(`/financial/summary?preset=${preset}`); const payments = useApi<PaymentOrder[]>(`/financial/payments?preset=${preset}`);
  async function downloadCsv() { const session = getSession(); if (!session) return; const response = await fetch(`${apiBaseUrl}/financial/exports/payments.csv?preset=${preset}`, { headers: { Authorization: `Bearer ${session.accessToken}` } }); if (!response.ok) throw new Error("Unable to export payments."); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href=url; anchor.download=`benzo-payments-${preset}.csv`; anchor.click(); URL.revokeObjectURL(url); }
  return <><div className="flex flex-wrap items-start justify-between gap-4"><PageHeading eyebrow="Finance" title={paymentsOnly ? "Payments" : "Financial reports"} description="Settled order records, discounts, wallet use, refunds, and exports." /><div className="flex gap-2"><select className="field h-10 rounded px-3 text-sm font-bold" value={preset} onChange={(event) => setPreset(event.target.value)}><option value="today">Today</option><option value="last7">Last 7 days</option><option value="last30">Last 30 days</option><option value="thisMonth">This month</option></select><button className={primaryButtonClass} onClick={() => void downloadCsv()}><Download size={16}/> CSV</button></div></div>
    {!paymentsOnly ? <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Gross sales" value={formatMoney(summary.data?.grossSalesInPaise ?? 0)} /><Metric label="Coupon discounts" value={formatMoney(summary.data?.couponDiscountsInPaise ?? 0)} /><Metric label="Referral discounts" value={formatMoney(summary.data?.referralDiscountsInPaise ?? 0)} /><Metric label="Wallet used" value={formatMoney(summary.data?.walletUsedInPaise ?? 0)} /><Metric label="Net revenue" value={formatMoney(summary.data?.netRevenueInPaise ?? 0)} /></section> : null}
    <DataState query={payments}>{(data) => <Table headers={["Student", "Course", "Base", "Discounts", "Wallet", "Paid", "Status", "Payment ID", "Date"]}>{data.map((order) => <tr key={order.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{order.student.user.name}</strong><p className="text-xs text-[var(--muted)]">{order.student.user.email}</p></td><td className={tdClass}>{order.course.title}</td><td className={tdClass}>{formatMoney(order.baseAmountInPaise)}</td><td className={tdClass}>{formatMoney(order.couponDiscountInPaise+order.referralDiscountInPaise)}</td><td className={tdClass}>{formatMoney(order.walletUsedInPaise)}</td><td className={tdClass}><strong>{formatMoney(order.finalAmountInPaise)}</strong></td><td className={tdClass}><StatusBadge value={order.status} /></td><td className={`${tdClass} font-mono text-xs`}>{order.payments[0]?.providerPaymentId ?? "-"}</td><td className={tdClass}>{formatDate(order.createdAt)}</td></tr>)}</Table>}</DataState>
  </>;
}

function CouponsPage() {
  type Coupon = { id: string; code: string; active: boolean; discountInPaise?: number | null; discountPercent?: number | null; startsAt?: string | null; endsAt?: string | null; _count: { redemptions: number; orders: number } };
  const coupons = useApi<Coupon[]>("/coupons"); const action = useAction(coupons.reload);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f=new FormData(event.currentTarget); const fixed=Number(f.get("fixed")); const percent=Number(f.get("percent")); await action.run(() => apiRequest("/coupons", { method:"POST", body:JSON.stringify({ code:f.get("code"), ...(fixed>0?{discountInPaise:Math.round(fixed*100)}:{}), ...(percent>0?{discountPercent:percent}:{}), active:true }) }), "Coupon created."); }
  return <><PageHeading eyebrow="Pricing" title="Coupons" description="Create fixed or percentage discounts used by backend checkout calculation." /><FormPanel title="New coupon"><form className="grid gap-3 md:grid-cols-4" onSubmit={(event)=>void create(event)}><Field name="code" label="Code" required /><Field name="fixed" label="Fixed discount (INR)" type="number" min="0" defaultValue="0" /><Field name="percent" label="Percentage" type="number" min="0" max="100" defaultValue="0" /><SubmitButton busy={action.busy} label="Create coupon" /></form></FormPanel><ActionNotice action={action} /><div className="mt-4"><DataState query={coupons}>{(data)=><Table headers={["Code","Discount","Usage","Validity","Status"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={`${tdClass} font-mono font-bold`}>{item.code}</td><td className={tdClass}>{item.discountInPaise?formatMoney(item.discountInPaise):`${item.discountPercent}%`}</td><td className={tdClass}>{item._count.redemptions} redeemed</td><td className={tdClass}>{item.endsAt?`Until ${formatDate(item.endsAt)}`:"No expiry"}</td><td className={tdClass}><StatusBadge value={item.active?"ACTIVE":"INACTIVE"}/></td></tr>)}</Table>}</DataState></div></>;
}

function ReferralsPage() {
  type Referral={id:string;status:string;createdAt:string;completedAt?:string|null;referrer:{user:UserSummary};referred:{user:UserSummary};qualifyingOrder?:{finalAmountInPaise:number}|null}; type WalletTx={id:string;amountInPaise:number;type:string;status:string;createdAt:string;user:UserSummary};
  const referrals=useApi<Referral[]>("/referrals/admin/all"); const wallet=useApi<WalletTx[]>("/wallet/admin/transactions");
  return <><PageHeading eyebrow="Growth" title="Referrals and wallets" description="Track pending referrals, successful rewards, and the corresponding wallet ledger." /><section className="grid gap-4 xl:grid-cols-2"><Panel title="Referral lifecycle"><DataState query={referrals}>{(data)=><div className="max-h-[560px] overflow-auto divide-y divide-[var(--line)]">{data.map((item)=><div className="py-3" key={item.id}><div className="flex justify-between gap-3"><strong>{item.referrer.user.name} to {item.referred.user.name}</strong><StatusBadge value={item.status}/></div><p className="mt-1 text-xs text-[var(--muted)]">{formatDate(item.createdAt)} | {item.qualifyingOrder?formatMoney(item.qualifyingOrder.finalAmountInPaise):"Waiting for qualifying payment"}</p></div>)}</div>}</DataState></Panel><Panel title="Wallet ledger"><DataState query={wallet}>{(data)=><div className="max-h-[560px] overflow-auto divide-y divide-[var(--line)]">{data.map((item)=><div className="flex justify-between gap-4 py-3" key={item.id}><div><strong>{item.user.name}</strong><p className="text-xs text-[var(--muted)]">{item.type} | {formatDate(item.createdAt)}</p></div><span className={item.amountInPaise>=0?"font-black text-emerald-700":"font-black text-red-700"}>{formatMoney(item.amountInPaise)}</span></div>)}</div>}</DataState></Panel></section></>;
}

function WithdrawalsPage() {
  type Withdrawal={id:string;amountInPaise:number;bankMasked:string;status:string;requestedAt:string;adminReference?:string|null;rejectionReason?:string|null;student:{user:UserSummary}}; const query=useApi<Withdrawal[]>("/withdrawals/admin/all"); const action=useAction(query.reload);
  async function resolve(event:FormEvent<HTMLFormElement>,item:Withdrawal,kind:"paid"|"reject"){event.preventDefault();const value=String(new FormData(event.currentTarget).get("value"));await action.run(()=>apiRequest(`/withdrawals/${item.id}/${kind}`,{method:"PATCH",body:JSON.stringify(kind==="paid"?{adminReference:value}:{reason:value})}),kind==="paid"?"Withdrawal marked paid.":"Withdrawal rejected and wallet released.");}
  return <><PageHeading eyebrow="Wallet" title="Withdrawal requests" description="Resolve pending referral-wallet withdrawals with a payment reference or rejection reason."/><ActionNotice action={action}/><DataState query={query}>{(data)=><Table headers={["Student","Amount","Bank","Requested","Status","Resolution"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{item.student.user.name}</strong><p className="text-xs text-[var(--muted)]">{item.student.user.email}</p></td><td className={tdClass}>{formatMoney(item.amountInPaise)}</td><td className={tdClass}>{item.bankMasked}</td><td className={tdClass}>{formatDate(item.requestedAt)}</td><td className={tdClass}><StatusBadge value={item.status}/></td><td className={tdClass}>{item.status==="PENDING"?<div className="grid gap-2"><form className="flex gap-2" onSubmit={(event)=>void resolve(event,item,"paid")}><input name="value" className="field h-9 min-w-0 px-2" placeholder="Payment reference" required minLength={3}/><button className={buttonClass}>Paid</button></form><form className="flex gap-2" onSubmit={(event)=>void resolve(event,item,"reject")}><input name="value" className="field h-9 min-w-0 px-2" placeholder="Rejection reason" required minLength={3}/><button className={buttonClass}>Reject</button></form></div>:<span className="text-xs text-[var(--muted)]">{item.adminReference??item.rejectionReason??"Resolved"}</span>}</td></tr>)}</Table>}</DataState></>;
}

function SalariesPage() {
  type Item={id:string;amountInPaise:number;attendancePercent:number;attendedSeconds:number;scheduledSeconds:number;status:string;rejectionReason?:string|null;instructor:{id:string;user:UserSummary};liveClass:{title:string;course:{title:string}}}; const items=useApi<Item[]>("/salary/admin/items"); const action=useAction(items.reload);
  async function approve(event:FormEvent<HTMLFormElement>,item:Item){event.preventDefault();const amount=Number(new FormData(event.currentTarget).get("amount"));await action.run(()=>apiRequest(`/salary/items/${item.id}/approve`,{method:"PATCH",body:JSON.stringify({amountInPaise:Math.round(amount*100)})}),"Salary item approved.");}
  async function reject(event:FormEvent<HTMLFormElement>,item:Item){event.preventDefault();const reason=new FormData(event.currentTarget).get("reason");await action.run(()=>apiRequest(`/salary/items/${item.id}/reject`,{method:"PATCH",body:JSON.stringify({reason})}),"Salary item rejected.");}
  async function pay(event:FormEvent<HTMLFormElement>,item:Item){event.preventDefault();const paymentReference=new FormData(event.currentTarget).get("reference");await action.run(()=>apiRequest("/salary/payouts",{method:"POST",body:JSON.stringify({instructorId:item.instructor.id,salaryItemIds:[item.id],paymentReference})}),"Salary payout recorded.");}
  return <><PageHeading eyebrow="Payroll" title="Instructor salary" description="Approve, adjust, reject, and pay class-level salary items backed by attendance."/><ActionNotice action={action}/><DataState query={items}>{(data)=><Table headers={["Instructor","Class","Attendance","Amount","Status","Action"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{item.instructor.user.name}</strong></td><td className={tdClass}>{item.liveClass.course.title}<p className="text-xs text-[var(--muted)]">{item.liveClass.title}</p></td><td className={tdClass}>{item.attendancePercent}%<p className="text-xs text-[var(--muted)]">{Math.round(item.attendedSeconds/60)} / {Math.round(item.scheduledSeconds/60)} min</p></td><td className={tdClass}>{formatMoney(item.amountInPaise)}</td><td className={tdClass}><StatusBadge value={item.status}/></td><td className={tdClass}>{item.status==="PENDING"?<div className="grid gap-2"><form className="flex gap-2" onSubmit={(event)=>void approve(event,item)}><input name="amount" className="field h-9 w-24 px-2" type="number" min="0" defaultValue={item.amountInPaise/100}/><button className={buttonClass}>Approve</button></form><form className="flex gap-2" onSubmit={(event)=>void reject(event,item)}><input name="reason" className="field h-9 min-w-0 px-2" placeholder="Reason" required minLength={3}/><button className={buttonClass}>Reject</button></form></div>:item.status==="APPROVED"?<form className="flex gap-2" onSubmit={(event)=>void pay(event,item)}><input name="reference" className="field h-9 min-w-0 px-2" placeholder="Payment reference" required minLength={3}/><button className={buttonClass}>Mark paid</button></form>:<span className="text-xs text-[var(--muted)]">{item.rejectionReason??"Complete"}</span>}</td></tr>)}</Table>}</DataState></>;
}

function CertificatesPage() {
  type Certificate={id:string;verificationCode:string;status:string;issuedAt:string;revocationReason?:string|null;student:{id:string;user:UserSummary};course:{id:string;title:string}}; const certificates=useApi<Certificate[]>("/certificates/admin/all"); const students=useApi<Student[]>("/students"); const courses=useApi<Course[]>("/courses/admin/all"); const action=useAction(certificates.reload);
  async function issue(event:FormEvent<HTMLFormElement>){event.preventDefault();const f=new FormData(event.currentTarget);await action.run(()=>apiRequest(`/certificates/admin/courses/${f.get("courseId")}/students/${f.get("studentId")}/issue`,{method:"POST"}),"Certificate issued.");}
  async function revoke(event:FormEvent<HTMLFormElement>,id:string){event.preventDefault();const reason=new FormData(event.currentTarget).get("reason");await action.run(()=>apiRequest(`/certificates/${id}/revoke`,{method:"PATCH",body:JSON.stringify({reason})}),"Certificate revoked.");}
  return <><PageHeading eyebrow="Completion" title="Certificates" description="Issue eligible certificates and revoke them with a permanent audit reason."/><FormPanel title="Issue certificate"><form className="grid gap-3 md:grid-cols-3" onSubmit={(event)=>void issue(event)}><SelectField name="studentId" label="Student" required options={(students.data??[]).map((item)=>[item.id,item.user.name])}/><SelectField name="courseId" label="Course" required options={(courses.data??[]).map((item)=>[item.id,item.title])}/><SubmitButton busy={action.busy} label="Check and issue"/></form></FormPanel><ActionNotice action={action}/><div className="mt-4"><DataState query={certificates}>{(data)=><Table headers={["Student","Course","Code","Issued","Status","Action"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}>{item.student.user.name}</td><td className={tdClass}>{item.course.title}</td><td className={`${tdClass} font-mono text-xs`}>{item.verificationCode}</td><td className={tdClass}>{formatDate(item.issuedAt)}</td><td className={tdClass}><StatusBadge value={item.status}/></td><td className={tdClass}>{item.status==="ISSUED"?<form className="flex gap-2" onSubmit={(event)=>void revoke(event,item.id)}><input className="field h-9 min-w-0 px-2" name="reason" placeholder="Revocation reason" required minLength={3}/><button className={buttonClass}>Revoke</button></form>:<span className="text-xs text-[var(--muted)]">{item.revocationReason}</span>}</td></tr>)}</Table>}</DataState></div></>;
}

function ChatPage() { const courses=useApi<Course[]>("/courses/admin/all"); return <><PageHeading eyebrow="Moderation" title="Course chat" description="Read course discussion, reply, and moderate messages with a recorded reason."/><CourseChat courses={courses.data??[]} canModerate /></>; }

function AnnouncementsPage() {
  type Announcement={id:string;title:string;body:string;audience:string;publishedAt:string;author:{name:string};course?:{title:string}|null}; const announcements=useApi<Announcement[]>("/notifications/announcements"); const courses=useApi<Course[]>("/courses/admin/all"); const action=useAction(announcements.reload);
  async function create(event:FormEvent<HTMLFormElement>){event.preventDefault();const f=new FormData(event.currentTarget);const audience=String(f.get("audience"));await action.run(()=>apiRequest("/notifications/announcements",{method:"POST",body:JSON.stringify({audience,...(audience==="COURSE"?{courseId:f.get("courseId")}:{ }),title:f.get("title"),body:f.get("body")})}),"Announcement published.");}
  return <><PageHeading eyebrow="Communication" title="Announcements" description="Publish to all users, students, instructors, or a single course."/><FormPanel title="Publish announcement"><form className="grid gap-3 md:grid-cols-2" onSubmit={(event)=>void create(event)}><SelectField name="audience" label="Audience" required options={[["ALL","Everyone"],["STUDENTS","Students"],["INSTRUCTORS","Instructors"],["COURSE","One course"]]}/><SelectField name="courseId" label="Course (required for course audience)" options={[["","Select course"],...(courses.data??[]).map((item)=>[item.id,item.title])]}/><Field name="title" label="Title" required/><TextArea name="body" label="Message" required/><SubmitButton busy={action.busy} label="Publish"/></form></FormPanel><ActionNotice action={action}/><div className="mt-4"><DataState query={announcements}>{(data)=><div className="grid gap-3">{data.map((item)=><article className="rounded border border-[var(--line)] bg-white p-4" key={item.id}><div className="flex justify-between gap-3"><strong>{item.title}</strong><StatusBadge value={item.audience}/></div><p className="mt-2 text-sm text-[var(--muted)]">{item.body}</p><p className="mt-3 text-xs text-[var(--muted)]">{item.author.name} | {item.course?.title??"Platform"} | {formatDate(item.publishedAt,true)}</p></article>)}</div>}</DataState></div></>;
}

function AuditLogsPage(){type Log={id:string;action:string;entity:string;entityId?:string|null;metadata?:Record<string,unknown>|null;createdAt:string;actor?:{name:string;email:string;role:string}|null};const logs=useApi<Log[]>("/users/audit-logs");return <><PageHeading eyebrow="Governance" title="Audit logs" description="Immutable operational events for financial, access, moderation, and account actions."/><DataState query={logs}>{(data)=><Table headers={["Time","Actor","Action","Entity","Details"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}>{formatDate(item.createdAt,true)}</td><td className={tdClass}>{item.actor?.name??"System"}<p className="text-xs text-[var(--muted)]">{item.actor?.role}</p></td><td className={tdClass}><strong>{item.action.replaceAll("_"," ")}</strong></td><td className={tdClass}>{item.entity}<p className="font-mono text-xs text-[var(--muted)]">{item.entityId}</p></td><td className={`${tdClass} max-w-sm break-words font-mono text-xs`}>{item.metadata?JSON.stringify(item.metadata):"-"}</td></tr>)}</Table>}</DataState></>}

function AdminsPage(){type Admin={id:string;user:UserSummary};const admins=useApi<Admin[]>("/admins");const action=useAction(admins.reload);async function create(event:FormEvent<HTMLFormElement>){event.preventDefault();const f=new FormData(event.currentTarget);await action.run(()=>apiRequest("/admins",{method:"POST",body:JSON.stringify({name:f.get("name"),email:f.get("email"),mobile:f.get("mobile")||undefined,temporaryPassword:f.get("password")})}),"Admin account created and activated.");}async function toggle(item:Admin){const status=item.user.status==="SUSPENDED"?"ACTIVE":"SUSPENDED";await action.run(()=>apiRequest(`/users/${item.user.id}/status`,{method:"PATCH",body:JSON.stringify({status})}),"Admin status updated.");}return <><PageHeading eyebrow="Super admin" title="Admin accounts" description="Create, suspend, and reactivate BENZO administrators."/><FormPanel title="Create admin"><form className="grid gap-3 md:grid-cols-4" onSubmit={(event)=>void create(event)}><Field name="name" label="Name" required/><Field name="email" label="Email" type="email" required/><Field name="mobile" label="Mobile" minLength={8}/><Field name="password" label="Temporary password" type="password" minLength={8} required/><SubmitButton busy={action.busy} label="Create admin"/></form></FormPanel><ActionNotice action={action}/><div className="mt-4"><DataState query={admins}>{(data)=><Table headers={["Admin","Email","Created","Status","Action"]}>{data.map((item)=><tr key={item.id} className="border-t border-[var(--line)]"><td className={tdClass}><strong>{item.user.name}</strong></td><td className={tdClass}>{item.user.email}</td><td className={tdClass}>{item.user.createdAt?formatDate(item.user.createdAt):"-"}</td><td className={tdClass}><StatusBadge value={item.user.status}/></td><td className={tdClass}><button className={buttonClass} onClick={()=>void toggle(item)}>{item.user.status==="SUSPENDED"?"Reactivate":"Suspend"}</button></td></tr>)}</Table>}</DataState></div></>}

export function CourseChat({courses,canModerate=false}:{courses:Array<Pick<Course,"id"|"title">>;canModerate?:boolean}){type Room={id:string};type Message={id:string;body:string;createdAt:string;sender:{name:string;role:string}};const[courseId,setCourseId]=useState("");const[room,setRoom]=useState<Room|null>(null);const[messages,setMessages]=useState<Message[]>([]);const[error,setError]=useState<string|null>(null);const[busy,setBusy]=useState(false);useEffect(()=>{if(!courseId&&courses[0])setCourseId(courses[0].id)},[courseId,courses]);async function reload(){if(!courseId)return;setBusy(true);setError(null);try{const nextRoom=await apiRequest<Room>(`/chat/courses/${courseId}/room`);setRoom(nextRoom);setMessages(await apiRequest<Message[]>(`/chat/rooms/${nextRoom.id}/messages`))}catch(caught){setError(caught instanceof Error?caught.message:"Unable to load chat.")}finally{setBusy(false)}}useEffect(()=>{void reload()},[courseId]);async function send(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!room)return;const form=event.currentTarget;const body=new FormData(form).get("body");await apiRequest(`/chat/rooms/${room.id}/messages`,{method:"POST",body:JSON.stringify({body})});form.reset();await reload()}async function moderate(id:string){if(!canModerate)return;await apiRequest(`/chat/messages/${id}/moderate`,{method:"PATCH",body:JSON.stringify({reason:"Removed by BENZO administrator"})});await reload()}return <div className="grid gap-4"><CoursePicker courses={courses} value={courseId} onChange={setCourseId}/>{error?<ErrorState message={error} onRetry={()=>void reload()}/>:null}<Panel title="Messages" action={<button className={buttonClass} onClick={()=>void reload()} disabled={busy}><RefreshCw size={14}/> Refresh</button>}><div className="max-h-[500px] overflow-y-auto divide-y divide-[var(--line)]">{messages.map((message)=><div className="flex gap-3 py-3" key={message.id}><div className="min-w-0 flex-1"><div className="flex gap-2"><strong>{message.sender.name}</strong><span className="text-xs text-[var(--muted)]">{message.sender.role} | {formatDate(message.createdAt,true)}</span></div><p className="mt-1 text-sm text-[var(--muted)]">{message.body}</p></div>{canModerate?<button className={buttonClass} onClick={()=>void moderate(message.id)}><Ban size={14}/> Remove</button>:null}</div>)}{!messages.length&&!busy?<Empty label="No messages yet"/>:null}{busy?<p className="py-4 text-sm text-[var(--muted)]">Loading messages...</p>:null}</div><form className="mt-4 flex gap-2" onSubmit={(event)=>void send(event)}><input className="field h-11 min-w-0 flex-1 rounded px-3" name="body" placeholder="Write a message" required minLength={1}/><button className={primaryButtonClass}><Send size={16}/> Send</button></form></Panel></div>}

function useAction(reload?:()=>Promise<unknown>){const[busy,setBusy]=useState(false);const[error,setError]=useState<string|null>(null);const[message,setMessage]=useState<string|null>(null);async function run(task:()=>Promise<unknown>,success:string){setBusy(true);setError(null);setMessage(null);try{await task();if(reload)await reload();setMessage(success)}catch(caught){setError(caught instanceof Error?caught.message:"Action failed.")}finally{setBusy(false)}}return{busy,error,message,run}}
function ActionNotice({action}:{action:{error:string|null;message:string|null}}){return <>{action.error?<p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{action.error}</p>:null}{action.message?<p className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{action.message}</p>:null}</>}
function DataState<T>({query,children}:{query:{data:T|null;loading:boolean;error:string|null;reload:()=>Promise<void>};children:(data:T)=>ReactNode}){if(query.loading)return <LoadingState/>;if(query.error)return <ErrorState message={query.error} onRetry={()=>void query.reload()}/>;return <>{query.data?children(query.data):<Empty label="No data"/>}</>}
function Table({headers,children}:{headers:string[];children:ReactNode}){return <div className="overflow-x-auto rounded border border-[var(--line)] bg-white"><table className={tableClass}><thead className="bg-[#edf1ef]"><tr>{headers.map((header)=><th className={thClass} key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
function Panel({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){return <section className="rounded border border-[var(--line)] bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-black text-[var(--ink)]">{title}</h2>{action}</div><div className="mt-3">{children}</div></section>}
function FormPanel({title,children,onClose}:{title:string;children:ReactNode;onClose?:()=>void}){return <section className="mb-4 rounded border border-[var(--line)] bg-white p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-black">{title}</h2>{onClose?<button className="grid size-9 place-items-center" aria-label="Close form" onClick={onClose}><X size={18}/></button>:null}</div>{children}</section>}
function Metric({label,value}:{label:string;value:string}){return <article className="rounded border border-[var(--line)] bg-white p-4"><p className="text-xs font-black uppercase text-[var(--muted)]">{label}</p><p className="mt-2 text-2xl font-black text-[var(--ink)]">{value}</p></article>}
function QueueLine({label,value,href}:{label:string;value:string|number;href:string}){return <a className="flex items-center justify-between border-b border-[var(--line)] py-3 text-sm last:border-0" href={href}><span className="font-bold">{label}</span><strong className="text-[var(--brand)]">{value}</strong></a>}
function HeadingAction({eyebrow,title,description,label,onClick}:{eyebrow:string;title:string;description:string;label:string;onClick:()=>void}){return <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><PageHeading eyebrow={eyebrow} title={title} description={description}/><button className={primaryButtonClass} onClick={onClick}><Plus size={16}/>{label}</button></div>}
function Field({label,...input}:{name:string;label:string;type?:string;required?:boolean;min?:string;max?:string;minLength?:number;placeholder?:string;defaultValue?:string}){return <label className="grid gap-1.5 text-sm font-bold">{label}<input className="field h-10 rounded px-3" {...input}/></label>}
function TextArea({name,label,required=false}:{name:string;label:string;required?:boolean}){return <label className="grid gap-1.5 text-sm font-bold">{label}<textarea className="field min-h-24 rounded p-3" name={name} required={required}/></label>}
function SelectField({name,label,options,required=false}:{name:string;label:string;options:string[][];required?:boolean}){return <label className="grid gap-1.5 text-sm font-bold">{label}<select className="field h-10 rounded px-3" name={name} required={required}>{options.map(([value,text])=><option value={value} key={`${name}-${value}`}>{text}</option>)}</select></label>}
function SubmitButton({busy,label}:{busy:boolean;label:string}){return <button className={`${primaryButtonClass} self-end`} type="submit" disabled={busy}>{busy?<Loader2 className="animate-spin" size={16}/>:<BadgeCheck size={16}/>} {label}</button>}
function CoursePicker({courses,value,onChange}:{courses:Array<Pick<Course,"id"|"title">>;value:string;onChange:(value:string)=>void}){return <label className="mb-4 flex max-w-md items-center gap-3 text-sm font-black">Course<select className="field h-10 min-w-0 flex-1 rounded px-3" value={value} onChange={(event)=>onChange(event.target.value)}>{courses.map((course)=><option value={course.id} key={course.id}>{course.title}</option>)}</select></label>}
function Empty({label}:{label:string}){return <p className="py-6 text-center text-sm text-[var(--muted)]">{label}</p>}
function lines(value:FormDataEntryValue|null){return String(value??"").split(/\r?\n/).map((item)=>item.trim()).filter(Boolean)}
function timeToMinute(value:string){const[hour=0,minute=0]=value.split(":").map(Number);return hour*60+minute}
