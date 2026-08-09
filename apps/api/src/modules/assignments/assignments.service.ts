import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAssignmentDto } from "./dto/create-assignment.dto";
import type { ReviewSubmissionDto } from "./dto/review-submission.dto";
import type { SubmitAssignmentDto } from "./dto/submit-assignment.dto";

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async listCourseAssignments(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.assignment.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: {
        submissions:
          user.role === "STUDENT"
            ? {
                where: { enrollment: { student: { userId: user.id } } }
              }
            : false
      }
    });
  }

  async createAssignment(user: CurrentUser, dto: CreateAssignmentDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);

    return this.prisma.assignment.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined
      }
    });
  }

  async submitAssignment(user: CurrentUser, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.getAssignment(assignmentId);
    const enrollment = await this.access.getActiveStudentEnrollment(user.id, assignment.courseId);
    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        enrollmentId: enrollment.id
      },
      orderBy: { submittedAt: "desc" }
    });

    if (existing && !["REJECTED", "RESUBMISSION_REQUIRED"].includes(existing.status)) {
      throw new ConflictException("Assignment has already been submitted.");
    }

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        enrollmentId: enrollment.id,
        submissionUrl: dto.submissionUrl,
        status: existing ? "RESUBMITTED" : "SUBMITTED"
      }
    });
  }

  async listSubmissions(user: CurrentUser, assignmentId: string) {
    const assignment = await this.getAssignment(assignmentId);
    await this.access.assertCanManageCourse(user, assignment.courseId);

    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: "desc" },
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true, mobile: true } }
              }
            }
          }
        }
      }
    });
  }

  async reviewSubmission(user: CurrentUser, submissionId: string, dto: ReviewSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true }
    });

    if (!submission) {
      throw new NotFoundException("Assignment submission not found.");
    }

    await this.access.assertCanManageCourse(user, submission.assignment.courseId);

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: dto.status,
        feedback: dto.feedback
      }
    });
  }

  private async getAssignment(assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new NotFoundException("Assignment not found.");
    }

    return assignment;
  }
}

