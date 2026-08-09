import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CurrentUser } from "../rbac/current-user";
import { PrismaService } from "../../modules/prisma/prisma.service";

@Injectable()
export class CourseAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanReadCourse(user: CurrentUser, courseId: string) {
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
      await this.assertCourseExists(courseId);
      return;
    }

    if (user.role === "INSTRUCTOR") {
      await this.assertInstructorAssigned(user.id, courseId);
      return;
    }

    await this.getActiveStudentEnrollment(user.id, courseId);
  }

  async assertCanManageCourse(user: CurrentUser, courseId: string) {
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
      await this.assertCourseExists(courseId);
      return;
    }

    if (user.role === "INSTRUCTOR") {
      await this.assertInstructorAssigned(user.id, courseId);
      return;
    }

    throw new ForbiddenException("Student cannot manage course content.");
  }

  async getActiveStudentEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId,
        active: true,
        student: { userId }
      },
      select: { id: true, studentId: true, courseId: true }
    });

    if (!enrollment) {
      throw new ForbiddenException("Student is not enrolled in this course.");
    }

    return enrollment;
  }

  private async assertCourseExists(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });

    if (!course) {
      throw new NotFoundException("Course not found.");
    }
  }

  private async assertInstructorAssigned(userId: string, courseId: string) {
    const instructor = await this.prisma.instructorProfile.findFirst({
      where: {
        userId,
        assignments: {
          some: {
            courseId,
            active: true
          }
        }
      },
      select: { id: true }
    });

    if (!instructor) {
      throw new ForbiddenException("Instructor is not assigned to this course.");
    }
  }
}

