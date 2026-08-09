import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BENZO, calculateAttendancePercent } from "@benzo/shared";
import { CertificateStatus, Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
import type { CurrentUser } from "../../common/rbac/current-user";
import { CourseAccessService } from "../../common/access/course-access.service";
import { PrismaService } from "../prisma/prisma.service";
import type { RevokeCertificateDto } from "./dto/revoke-certificate.dto";

const certificateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  listMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { student: { userId } },
      orderBy: { issuedAt: "desc" },
      include: this.certificateInclude()
    });
  }

  listCertificatesForAdmin() {
    return this.prisma.certificate.findMany({
      take: 200,
      orderBy: { issuedAt: "desc" },
      include: this.certificateInclude()
    });
  }

  async getMyEligibility(userId: string, courseId: string) {
    const student = await this.getStudentByUser(userId);
    return this.calculateEligibility(student.id, student.userId, courseId);
  }

  async issueMyCertificate(userId: string, courseId: string) {
    const student = await this.getStudentByUser(userId);
    return this.issueCertificate({ actorId: userId, studentId: student.id, studentUserId: student.userId, courseId });
  }

  async issueCertificateForStudent(actor: CurrentUser, courseId: string, studentId: string) {
    await this.access.assertCanManageCourse(actor, courseId);
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { id: true, userId: true }
    });

    if (!student) {
      throw new NotFoundException("Student not found.");
    }

    return this.issueCertificate({ actorId: actor.id, studentId: student.id, studentUserId: student.userId, courseId });
  }

  async revokeCertificate(actorId: string, certificateId: string, dto: RevokeCertificateDto) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { student: true, course: true }
    });

    if (!certificate) {
      throw new NotFoundException("Certificate not found.");
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      return certificate;
    }

    const revoked = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.certificate.update({
        where: { id: certificateId },
        data: {
          status: CertificateStatus.REVOKED,
          revokedAt: new Date(),
          revokedById: actorId,
          revocationReason: dto.reason
        },
        include: this.certificateInclude()
      });

      await tx.notification.create({
        data: {
          userId: certificate.student.userId,
          type: "CERTIFICATE",
          title: "Certificate revoked",
          body: `${certificate.course.title} certificate was revoked. Reason: ${dto.reason}`,
          linkUrl: "/student/certificates"
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: "CERTIFICATE_REVOKED",
          entity: "Certificate",
          entityId: certificateId,
          metadata: {
            reason: dto.reason,
            verificationCode: certificate.verificationCode
          }
        }
      });

      return updated;
    });

    return this.withVerificationUrl(revoked);
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: this.certificateInclude()
    });

    if (!certificate) {
      return {
        valid: false,
        status: "NOT_FOUND",
        verificationCode
      };
    }

    return {
      valid: certificate.status === CertificateStatus.ISSUED,
      status: certificate.status,
      verificationCode: certificate.verificationCode,
      studentName: certificate.student.user.name,
      courseName: certificate.course.title,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      verificationUrl: this.verificationUrl(certificate.verificationCode)
    };
  }

  private async issueCertificate(input: {
    actorId: string;
    studentId: string;
    studentUserId: string;
    courseId: string;
  }) {
    const existing = await this.prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: input.studentId,
          courseId: input.courseId
        }
      },
      include: this.certificateInclude()
    });

    if (existing?.status === CertificateStatus.ISSUED) {
      return this.withVerificationUrl(existing);
    }

    if (existing?.status === CertificateStatus.REVOKED) {
      throw new ConflictException("A revoked certificate cannot be reissued automatically.");
    }

    const eligibility = await this.calculateEligibility(input.studentId, input.studentUserId, input.courseId);

    if (!eligibility.eligible) {
      throw new BadRequestException({
        message: "Certificate requirements are not complete.",
        eligibility
      });
    }

    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
      select: { slug: true, title: true }
    });

    if (!course) {
      throw new NotFoundException("Course not found.");
    }

    const prefix = course.slug
      .split("-")
      .map((part) => part[0])
      .join("")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();
    const code = `BENZO-${prefix || "CERT"}-${certificateCode()}`;

    const certificate = await this.prisma.$transaction(async (tx) => {
      const created = await tx.certificate.create({
        data: {
          studentId: input.studentId,
          courseId: input.courseId,
          verificationCode: code,
          issuedById: input.actorId,
          eligibleSnapshot: eligibility as unknown as Prisma.InputJsonValue
        },
        include: this.certificateInclude()
      });

      await tx.notification.create({
        data: {
          userId: input.studentUserId,
          type: "CERTIFICATE",
          title: "Certificate issued",
          body: `${course.title} certificate is ready for verification.`,
          linkUrl: "/student/certificates"
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: input.actorId,
          action: "CERTIFICATE_ISSUED",
          entity: "Certificate",
          entityId: created.id,
          metadata: {
            courseId: input.courseId,
            studentId: input.studentId,
            verificationCode: code
          }
        }
      });

      return created;
    });

    return this.withVerificationUrl(certificate);
  }

  private async calculateEligibility(studentId: string, studentUserId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        active: true
      },
      select: { id: true }
    });

    if (!enrollment) {
      throw new NotFoundException("Active enrollment not found for this course.");
    }

    const [courseCompletion, attendance, assignments, quizzes] = await Promise.all([
      this.calculateCourseCompletion(enrollment.id, courseId),
      this.calculateAttendance(studentUserId, courseId),
      this.calculateAssignments(enrollment.id, courseId),
      this.calculateQuizzes(enrollment.id, courseId)
    ]);

    return {
      eligible: courseCompletion.passed && attendance.passed && assignments.passed && quizzes.passed,
      courseId,
      studentId,
      courseCompletion,
      attendance,
      assignments,
      quizzes
    };
  }

  private async calculateCourseCompletion(enrollmentId: string, courseId: string) {
    const [lessonCount, completedCount] = await Promise.all([
      this.prisma.lesson.count({ where: { courseId } }),
      this.prisma.lessonProgress.count({
        where: {
          enrollmentId,
          completed: true,
          lesson: { courseId }
        }
      })
    ]);

    return {
      lessonCount,
      completedCount,
      completionPercent: lessonCount === 0 ? 0 : Math.round((completedCount / lessonCount) * 100),
      passed: lessonCount > 0 && completedCount === lessonCount
    };
  }

  private async calculateAttendance(studentUserId: string, courseId: string) {
    const liveClasses = await this.prisma.liveClass.findMany({
      where: {
        courseId,
        status: "COMPLETED"
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        attendanceSummaries: {
          where: { userId: studentUserId },
          select: { attendedSeconds: true, scheduledSeconds: true }
        }
      }
    });

    const totals = liveClasses.reduce(
      (acc, liveClass) => {
        const summary = liveClass.attendanceSummaries[0];
        const scheduledSeconds =
          summary?.scheduledSeconds ??
          Math.max(0, Math.floor((liveClass.endsAt.getTime() - liveClass.startsAt.getTime()) / 1000));

        return {
          attendedSeconds: acc.attendedSeconds + (summary?.attendedSeconds ?? 0),
          scheduledSeconds: acc.scheduledSeconds + scheduledSeconds
        };
      },
      { attendedSeconds: 0, scheduledSeconds: 0 }
    );
    const percent = calculateAttendancePercent(totals.attendedSeconds, totals.scheduledSeconds);

    return {
      completedClassCount: liveClasses.length,
      attendedSeconds: totals.attendedSeconds,
      scheduledSeconds: totals.scheduledSeconds,
      percent,
      requiredPercent: BENZO.presentThresholdPercent,
      passed: liveClasses.length > 0 && percent >= BENZO.presentThresholdPercent
    };
  }

  private async calculateAssignments(enrollmentId: string, courseId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { courseId, required: true },
      select: {
        id: true,
        title: true,
        submissions: {
          where: {
            enrollmentId,
            status: "APPROVED"
          },
          take: 1
        }
      }
    });
    const pending = assignments.filter((assignment) => assignment.submissions.length === 0);

    return {
      requiredCount: assignments.length,
      approvedCount: assignments.length - pending.length,
      pending: pending.map((assignment) => ({ id: assignment.id, title: assignment.title })),
      passed: pending.length === 0
    };
  }

  private async calculateQuizzes(enrollmentId: string, courseId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId, required: true },
      select: {
        id: true,
        title: true,
        passingPercent: true,
        questions: { select: { points: true } },
        attempts: {
          where: { enrollmentId },
          select: { score: true }
        }
      }
    });
    const results = quizzes.map((quiz) => {
      const maxScore = quiz.questions.reduce((total, question) => total + question.points, 0);
      const bestPercent =
        maxScore === 0
          ? 0
          : quiz.attempts.reduce((best, attempt) => {
              const percent = Math.round((attempt.score / maxScore) * 100);
              return Math.max(best, percent);
            }, 0);

      return {
        id: quiz.id,
        title: quiz.title,
        passingPercent: quiz.passingPercent,
        bestPercent,
        passed: bestPercent >= quiz.passingPercent
      };
    });

    return {
      requiredCount: results.length,
      passedCount: results.filter((quiz) => quiz.passed).length,
      pending: results.filter((quiz) => !quiz.passed),
      passed: results.every((quiz) => quiz.passed)
    };
  }

  private async getStudentByUser(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true }
    });

    if (!student) {
      throw new NotFoundException("Student profile not found.");
    }

    return student;
  }

  private certificateInclude() {
    return {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      course: { select: { id: true, title: true, slug: true } },
      issuedBy: { select: { id: true, name: true, role: true } },
      revokedBy: { select: { id: true, name: true, role: true } }
    } as const;
  }

  private withVerificationUrl<T extends { verificationCode: string }>(certificate: T) {
    return {
      ...certificate,
      verificationUrl: this.verificationUrl(certificate.verificationCode)
    };
  }

  private verificationUrl(code: string) {
    return `${BENZO.productionUrl}/verify/${encodeURIComponent(code)}`;
  }
}
