import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudentEnrollments(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!student) {
      throw new NotFoundException("Student profile not found.");
    }

    return this.prisma.enrollment.findMany({
      where: { studentId: student.id, active: true },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDesc: true,
            thumbnail: true,
            schedules: {
              where: { active: true },
              select: { dayOfWeek: true, startMinute: true, endMinute: true, timezone: true }
            }
          }
        }
      }
    });
  }

  async listCourseEnrollments(user: CurrentUser, courseId: string) {
    if (user.role === "INSTRUCTOR") {
      const allowed = await this.prisma.instructorProfile.findFirst({
        where: {
          userId: user.id,
          assignments: {
            some: {
              courseId,
              active: true
            }
          }
        },
        select: { id: true }
      });

      if (!allowed) {
        throw new ForbiddenException("Instructor is not assigned to this course.");
      }
    }

    return this.prisma.enrollment.findMany({
      where: { courseId, active: true },
      orderBy: { enrolledAt: "desc" },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                status: true
              }
            }
          }
        }
      }
    });
  }
}

