import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AnnouncementAudience, Prisma } from "@prisma/client";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAnnouncementDto } from "./dto/create-announcement.dto";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  listMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        announcement: {
          include: { course: { select: { id: true, title: true, slug: true } } }
        }
      }
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new NotFoundException("Notification not found.");
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt ?? new Date() }
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });
  }

  async listAnnouncements(user: CurrentUser) {
    const where = await this.announcementScopeForUser(user);

    return this.prisma.announcement.findMany({
      where,
      take: 100,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, role: true } },
        course: { select: { id: true, title: true, slug: true } }
      }
    });
  }

  async createAnnouncement(user: CurrentUser, dto: CreateAnnouncementDto) {
    await this.assertCanCreateAnnouncement(user, dto);
    const recipientIds = await this.resolveAudienceRecipientIds(dto);

    return this.prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          authorId: user.id,
          courseId: dto.courseId,
          audience: dto.audience,
          title: dto.title,
          body: dto.body
        }
      });

      if (recipientIds.length > 0) {
        await tx.notification.createMany({
          data: recipientIds.map((userId) => ({
            userId,
            announcementId: announcement.id,
            type: "ANNOUNCEMENT",
            title: dto.title,
            body: dto.body,
            linkUrl: dto.courseId ? "/student/courses" : "/student/notifications"
          }))
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "ANNOUNCEMENT_PUBLISHED",
          entity: "Announcement",
          entityId: announcement.id,
          metadata: {
            audience: dto.audience,
            courseId: dto.courseId,
            recipientCount: recipientIds.length
          }
        }
      });

      return tx.announcement.findUnique({
        where: { id: announcement.id },
        include: {
          author: { select: { id: true, name: true, role: true } },
          course: { select: { id: true, title: true, slug: true } }
        }
      });
    });
  }

  private async assertCanCreateAnnouncement(user: CurrentUser, dto: CreateAnnouncementDto) {
    if (dto.audience === AnnouncementAudience.COURSE && !dto.courseId) {
      throw new BadRequestException("Course announcements require a courseId.");
    }

    if (dto.audience !== AnnouncementAudience.COURSE && dto.courseId) {
      throw new BadRequestException("Only course announcements can include a courseId.");
    }

    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
      if (dto.courseId) {
        await this.access.assertCanManageCourse(user, dto.courseId);
      }
      return;
    }

    if (user.role === "INSTRUCTOR" && dto.audience === AnnouncementAudience.COURSE && dto.courseId) {
      await this.access.assertCanManageCourse(user, dto.courseId);
      return;
    }

    throw new ForbiddenException("User cannot publish this announcement.");
  }

  private async resolveAudienceRecipientIds(dto: CreateAnnouncementDto) {
    if (dto.audience === AnnouncementAudience.COURSE) {
      return this.resolveCourseRecipientIds(dto.courseId);
    }

    const where =
      dto.audience === AnnouncementAudience.ALL
        ? { status: "ACTIVE" as const }
        : dto.audience === AnnouncementAudience.STUDENTS
          ? { status: "ACTIVE" as const, role: "STUDENT" as const }
          : { status: "ACTIVE" as const, role: "INSTRUCTOR" as const };
    const users = await this.prisma.user.findMany({
      where,
      select: { id: true }
    });

    return users.map((user) => user.id);
  }

  private async resolveCourseRecipientIds(courseId: string | undefined) {
    if (!courseId) {
      throw new BadRequestException("Course announcements require a courseId.");
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: { active: true },
          select: { student: { select: { userId: true } } }
        },
        assignments: {
          where: { active: true },
          select: { instructor: { select: { userId: true } } }
        }
      }
    });

    if (!course) {
      throw new NotFoundException("Course not found.");
    }

    return [
      ...new Set([
        ...course.enrollments.map((enrollment) => enrollment.student.userId),
        ...course.assignments.map((assignment) => assignment.instructor.userId)
      ])
    ];
  }

  private async announcementScopeForUser(user: CurrentUser): Promise<Prisma.AnnouncementWhereInput> {
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
      return {};
    }

    if (user.role === "STUDENT") {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { active: true, student: { userId: user.id } },
        select: { courseId: true }
      });

      return {
        OR: [
          { audience: AnnouncementAudience.ALL },
          { audience: AnnouncementAudience.STUDENTS },
          {
            audience: AnnouncementAudience.COURSE,
            courseId: { in: enrollments.map((enrollment) => enrollment.courseId) }
          }
        ]
      };
    }

    const assignments = await this.prisma.courseInstructorAssignment.findMany({
      where: {
        active: true,
        instructor: { userId: user.id }
      },
      select: { courseId: true }
    });

    return {
      OR: [
        { audience: AnnouncementAudience.ALL },
        { audience: AnnouncementAudience.INSTRUCTORS },
        {
          audience: AnnouncementAudience.COURSE,
          courseId: { in: assignments.map((assignment) => assignment.courseId) }
        }
      ]
    };
  }
}
