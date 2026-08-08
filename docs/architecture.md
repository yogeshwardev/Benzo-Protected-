# BENZO Architecture

BENZO is an instructor-led technology learning platform for real students, instructors, payments, referrals, attendance, salaries, and certificates. This document is the foundation contract for implementation.

## 1. Final Architecture

BENZO uses a TypeScript-first monorepo:

- `apps/web`: Next.js App Router frontend.
- `apps/api`: NestJS backend API.
- `packages/shared`: shared constants, validation primitives, and business rules.
- `packages/types`: shared DTO and domain types.
- `packages/config`: shared TypeScript and lint configuration.
- `packages/ui`: reusable React UI primitives.
- `prisma`: relational schema and migrations.
- `docker`: production and ops configuration.
- `docs`: product, architecture, security, deployment, and runbooks.

The backend owns all business authority: pricing, permissions, enrollment, payments, referrals, wallet movements, attendance, and salary calculations.

## 2. Monorepo Folder Structure

```text
benzo/
  apps/
    web/
    api/
  packages/
    shared/
    types/
    config/
    ui/
  prisma/
  docker/
    nginx/
  scripts/
  docs/
  .github/workflows/
```

## 3. Database Entity Relationship Plan

Core relationships:

- `User` has one role and optional role-specific profile: `StudentProfile`, `InstructorProfile`, or `AdminProfile`.
- `Course` has one active instructor assignment and many enrollments, schedules, lessons, live classes, materials, assignments, quizzes, chats, and certificates.
- `Order` belongs to a student and course. A paid order creates exactly one `Enrollment`.
- `Payment` belongs to an order. Razorpay webhook events are stored with unique provider event IDs for idempotency.
- `Referral` links referrer, referred student, and the qualifying order.
- `WalletTransaction` is the source of truth for wallet balances.
- `WithdrawalRequest` reserves wallet funds, then completes or reverses them.
- `LiveClass` belongs to a course schedule and produces student/instructor attendance, recordings, and salary items.
- `Certificate` belongs to a student enrollment and has a public verification code.

## 4. Main Prisma Models

Main models are defined in `prisma/schema.prisma`:

- Identity: `User`, `RefreshToken`, `EmailVerificationToken`, `PasswordResetToken`, `AdminProfile`, `StudentProfile`, `InstructorProfile`.
- Learning: `Course`, `CourseInstructorAssignment`, `CourseSchedule`, `Enrollment`, `Lesson`, `Material`, `Assignment`, `AssignmentSubmission`, `Quiz`, `QuizQuestion`, `QuizAttempt`.
- Commerce: `Order`, `Payment`, `RazorpayWebhookEvent`, `Coupon`, `CouponRedemption`, `Invoice`.
- Referral and wallet: `Referral`, `WalletTransaction`, `WithdrawalRequest`.
- Live and attendance: `LiveClass`, `AttendanceSession`, `AttendanceSummary`, `Recording`.
- Operations: `InstructorSalaryItem`, `InstructorSalaryPayout`, `ChatRoom`, `ChatMessage`, `Notification`, `AuditLog`, `Certificate`.

## 5. API and Module Architecture

NestJS modules:

- `auth`, `users`, `students`, `instructors`, `admins`
- `courses`, `schedules`, `live-classes`, `attendance`
- `recordings`, `materials`, `assignments`, `quizzes`
- `pricing`, `payments`, `orders`, `coupons`
- `referrals`, `wallet`, `withdrawals`
- `salary`, `certificates`, `chat`, `notifications`
- `analytics`, `audit`, `uploads`, `health`

Modules expose controllers for HTTP and services for business logic. Prisma access is centralized behind module services and transaction boundaries for financial workflows.

## 6. Authentication Architecture

- Argon2 password hashing.
- Email verification before sensitive student actions.
- Short-lived access tokens.
- Rotating refresh tokens stored as hashed database records.
- Password reset tokens are single-use and short-lived.
- Instructor and admin accounts are created by privileged users and activated through secure set-password flows.
- No public super admin signup. First super admin is created by a bootstrap script with explicit environment gates.

## 7. RBAC Architecture

Backend guards enforce:

- `SUPER_ADMIN`: all admin permissions plus super-admin-only account controls and audit visibility.
- `ADMIN`: operational business management.
- `INSTRUCTOR`: only assigned course data and allowed teaching tools.
- `STUDENT`: own account, enrollments, payments, wallet, course access, chats, and certificates.

Every sensitive API checks both role and resource ownership. The UI may hide unavailable controls, but the backend remains authoritative.

## 8. Payment Architecture

Checkout:

1. Student selects a course.
2. API calculates authoritative price, discounts, referral, coupon, wallet use, and final amount.
3. API creates an internal `Order` and Razorpay order.
4. Frontend opens Razorpay with public key only.
5. API verifies Razorpay signature.
6. Webhook confirms payment.
7. In one database transaction: mark order paid, create enrollment, process referral, write wallet ledger rows, generate invoice job, notify student.

Duplicate webhooks are ignored through unique `RazorpayWebhookEvent.providerEventId` and unique references on downstream records.

## 9. Referral and Wallet Architecture

- Every student receives a referral code.
- Registration through referral creates a `PENDING` referral only.
- A qualifying paid purchase completes the referral.
- Referred student gets INR 200 discount when eligible.
- Referrer receives INR 200 wallet credit after payment success.
- Wallet balance is computed from settled ledger transactions, never stored as an editable number.
- Withdrawal reserves funds, then either completes as debit or reverses on rejection.

## 10. Attendance Architecture

LiveKit join/leave events and periodic presence heartbeats create `AttendanceSession` rows. Attendance summaries are calculated against the official scheduled class window, not early waiting time.

States:

- `PRESENT`: at least 80 percent.
- `PARTIAL`: greater than 0 and less than 80 percent.
- `ABSENT`: 0 percent.

Reconnects are merged by session windows with duplicate event tolerance.

## 11. Salary Architecture

Instructor salary is derived from official class attendance, class completion, and admin approval:

- `InstructorSalaryItem` is created per payable class.
- Admin reviews exceptions and approves.
- `InstructorSalaryPayout` groups approved salary items and records payment reference.
- Instructor sees only own salary records.

## 12. LiveKit Architecture

The browser never receives LiveKit secrets. API generates scoped LiveKit tokens after verifying:

- Student is active and enrolled in the course for the class.
- Instructor is active and assigned to the course.
- Join window rules are satisfied.

LiveKit webhooks feed attendance and recording processing jobs.

## 13. Recording Architecture

Live class recordings are stored as provider-controlled video assets:

- LiveKit produces or initiates recording.
- Processing jobs upload or register video with Bunny Stream.
- `Recording` stores provider video ID, duration, thumbnail, processing state, lesson or live class relation, and authorization metadata.
- Students stream through controlled access, not raw MP4 links.

## 14. Chat Architecture

Chat rooms are scoped:

- Course group room: enrolled students, assigned instructor, admins.
- Private instructor-student room: enrolled student and assigned instructor.
- Admin moderation has audited access.

Message APIs validate membership on every read/write.

## 15. Frontend Route Map

Public:

- `/`
- `/courses`
- `/courses/[slug]`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/verify-certificate/[code]`

Student:

- `/student`
- `/student/courses`
- `/student/courses/[slug]`
- `/student/live/[classId]`
- `/student/assignments`
- `/student/quizzes`
- `/student/payments`
- `/student/wallet`
- `/student/certificates`
- `/student/referrals`

Instructor:

- `/instructor`
- `/instructor/classes`
- `/instructor/live/[classId]`
- `/instructor/materials`
- `/instructor/assignments`
- `/instructor/quizzes`
- `/instructor/students`
- `/instructor/salary`
- `/instructor/chat`

Admin:

- `/admin`
- `/admin/students`
- `/admin/instructors`
- `/admin/courses`
- `/admin/schedules`
- `/admin/live-classes`
- `/admin/payments`
- `/admin/referrals`
- `/admin/wallet-withdrawals`
- `/admin/salaries`
- `/admin/certificates`
- `/admin/analytics`
- `/admin/audit`

## 16. Admin Dashboard Structure

The admin dashboard prioritizes work queues:

- Pending withdrawals.
- Payment issues.
- Upcoming live classes.
- Instructor salary approvals.
- Certificate eligibility.
- Failed webhooks.
- Gross sales, discounts, wallet use, refunds, and net revenue.

## 17. Instructor Dashboard Structure

The instructor dashboard prioritizes:

- Today's assigned class and join availability.
- Pending assignment reviews.
- Quiz performance.
- Student attendance risks.
- Course chat and private messages.
- Salary status.

## 18. Student Dashboard Structure

The student dashboard prioritizes:

- Next live class.
- Continue learning.
- Pending assignments.
- Available quizzes.
- Attendance progress.
- Payments and invoices.
- Referral wallet and withdrawals.

## 19. Public Website Structure

The public site builds trust through:

- Real course catalog.
- Instructor identity.
- Schedule and price transparency.
- Clear included benefits.
- Razorpay payment trust.
- Support, refund, terms, and privacy links.
- No fake urgency, fake counts, or deceptive social proof.

## 20. Design System

Tone: clear, trustworthy, practical, student-friendly.

UI principles:

- Dense but readable dashboards.
- Action-first cards and tables.
- Mobile-first navigation.
- Accessible contrast and focus states.
- Tailwind CSS plus shadcn-style primitives.
- Lucide icons for tool actions.
- No oversized marketing-first dashboard shells.

Foundation tokens are in `apps/web/src/app/globals.css`.

## 21. Security Architecture

- Backend-enforced authorization.
- Rate limits for auth, checkout, coupon/referral validation, withdrawals, and admin APIs.
- Strict validation with DTOs and Zod/shared schemas where applicable.
- Secure HTTP headers via Nginx and application middleware.
- Secrets only in environment variables.
- Sensitive data redaction in logs.
- File validation for size, MIME, extension, and authorization.
- Bank details masked in UI and restricted in APIs.
- Audit logs for privileged changes and financial events.

## 22. Deployment Architecture

Initial AWS deployment:

```text
Internet -> DNS -> Nginx on EC2 -> web/api containers
                                  -> PostgreSQL container/private service
                                  -> Redis container/private service
External: Razorpay, LiveKit, Bunny Stream, Cloudflare R2, Resend
```

Region: `ap-south-1`.

Only ports 22, 80, and 443 are public. PostgreSQL, Redis, Next.js, and NestJS ports stay private.

## 23. CI/CD Workflow

GitHub Actions runs:

- Install.
- Prisma validation.
- Lint.
- Type check.
- Unit tests.
- Frontend build.
- Backend build.
- Docker build check.

Production deploy from `main`:

- SSH to EC2 using repository secrets.
- Upload/restart updated containers without intentionally dropping all services.
- Run `prisma migrate deploy`.
- Run health check.
- Retain previous image for rollback.

## 24. Development Phases

1. Foundation: monorepo, apps, packages, Prisma, Redis, Docker, design system.
2. Identity: auth, roles, super admin bootstrap, admin/student/instructor accounts.
3. Courses: course management, instructor assignment, schedules, enrollment.
4. Commerce: pricing, Razorpay, orders, coupons, referrals, wallet, invoices.
5. Learning: modules, lessons, materials, recordings, progress.
6. Live class: LiveKit, authorization, recording, attendance.
7. Academics: assignments, submissions, quizzes, results.
8. Business operations: salary, financial reports, withdrawals.
9. Engagement: chat, notifications, announcements.
10. Completion: certificates and QR verification.
11. Production: security audit, testing, CI/CD, Nginx, HTTPS, backups, monitoring.

## Workflow Integrity Check

The architecture keeps BENZO as one connected business system:

- Payment affects orders, enrollment, referrals, wallet, reports, invoices, and access.
- Course affects instructor, schedule, classes, materials, assignments, quizzes, attendance, chat, and certificates.
- Live class affects attendance, recording, and salary.
- Referral affects checkout, referral state, wallet ledger, and withdrawals.

