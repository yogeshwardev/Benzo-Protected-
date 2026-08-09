import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateLiveClassDto } from "./dto/create-live-class.dto";
import type { UpdateLiveClassStatusDto } from "./dto/update-live-class-status.dto";
import { LiveKitTokenService } from "./livekit-token.service";

@Injectable()
export class LiveClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService,
    private readonly livekit: LiveKitTokenService
  ) {}

  async listCourseClasses(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.liveClass.findMany({
      where: { courseId },
      orderBy: { startsAt: "desc" },
      take: 100,
      include: {
        schedule: true,
        recordings: true
      }
    });
  }

  async listMyUpcoming(user: CurrentUser) {
    const now = new Date();

    if (user.role === "STUDENT") {
      return this.prisma.liveClass.findMany({
        where: {
          startsAt: { gte: now },
          status: { in: ["SCHEDULED", "LIVE"] },
          course: {
            enrollments: {
              some: {
                active: true,
                student: { userId: user.id }
              }
            }
          }
        },
        orderBy: { startsAt: "asc" },
        take: 20,
        include: { course: { select: { title: true, slug: true } } }
      });
    }

    return this.prisma.liveClass.findMany({
      where: {
        startsAt: { gte: now },
        status: { in: ["SCHEDULED", "LIVE"] },
        course: {
          assignments: {
            some: {
              active: true,
              instructor: { userId: user.id }
            }
          }
        }
      },
      orderBy: { startsAt: "asc" },
      take: 20,
      include: { course: { select: { title: true, slug: true } } }
    });
  }

  async createLiveClass(user: CurrentUser, dto: CreateLiveClassDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);
    await this.assertScheduleBelongsToCourse(dto.scheduleId, dto.courseId);
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestException("Class end time must be after start time.");
    }

    return this.prisma.liveClass.create({
      data: {
        courseId: dto.courseId,
        scheduleId: dto.scheduleId,
        title: dto.title,
        startsAt,
        endsAt,
        livekitRoom: `benzo-${dto.courseId}-${startsAt.getTime()}`
      }
    });
  }

  async updateStatus(user: CurrentUser, id: string, dto: UpdateLiveClassStatusDto) {
    const liveClass = await this.getLiveClass(id);
    await this.access.assertCanManageCourse(user, liveClass.courseId);

    return this.prisma.liveClass.update({
      where: { id },
      data: { status: dto.status }
    });
  }

  async issueJoinToken(user: CurrentUser, id: string) {
    const liveClass = await this.getLiveClass(id);

    if (liveClass.status === "CANCELLED" || liveClass.status === "COMPLETED") {
      throw new ForbiddenException("Live class is not joinable.");
    }

    if (user.role === "INSTRUCTOR") {
      await this.access.assertCanManageCourse(user, liveClass.courseId);
      this.assertInstructorJoinWindow(liveClass.startsAt, liveClass.endsAt);
    } else {
      await this.access.getActiveStudentEnrollment(user.id, liveClass.courseId);
      this.assertStudentJoinWindow(liveClass.startsAt, liveClass.endsAt);
    }

    const room = liveClass.livekitRoom ?? `benzo-${liveClass.id}`;

    if (!liveClass.livekitRoom) {
      await this.prisma.liveClass.update({
        where: { id: liveClass.id },
        data: { livekitRoom: room }
      });
    }

    return this.livekit.createRoomToken({
      identity: user.id,
      name: user.email,
      room,
      grants: {
        room,
        roomJoin: true,
        canPublish: user.role === "INSTRUCTOR",
        canSubscribe: true,
        canPublishData: true
      },
      metadata: {
        role: user.role,
        liveClassId: liveClass.id,
        courseId: liveClass.courseId
      }
    });
  }

  private async getLiveClass(id: string) {
    const liveClass = await this.prisma.liveClass.findUnique({ where: { id } });

    if (!liveClass) {
      throw new NotFoundException("Live class not found.");
    }

    return liveClass;
  }

  private async assertScheduleBelongsToCourse(scheduleId: string | undefined, courseId: string) {
    if (!scheduleId) {
      return;
    }

    const schedule = await this.prisma.courseSchedule.findUnique({
      where: { id: scheduleId },
      select: { courseId: true }
    });

    if (!schedule) {
      throw new NotFoundException("Course schedule not found.");
    }

    if (schedule.courseId !== courseId) {
      throw new BadRequestException("Schedule does not belong to this course.");
    }
  }

  private assertInstructorJoinWindow(startsAt: Date, endsAt: Date) {
    const now = Date.now();
    const earliest = startsAt.getTime() - BENZO.instructorEarlyJoinMinutes * 60 * 1000;
    const latest = endsAt.getTime() + 15 * 60 * 1000;

    if (now < earliest || now > latest) {
      throw new ForbiddenException("Instructor can join only during the allowed class window.");
    }
  }

  private assertStudentJoinWindow(startsAt: Date, endsAt: Date) {
    const now = Date.now();
    const earliest = startsAt.getTime() - 10 * 60 * 1000;
    const latest = endsAt.getTime() + 15 * 60 * 1000;

    if (now < earliest || now > latest) {
      throw new ForbiddenException("Student can join only during the allowed class window.");
    }
  }
}

