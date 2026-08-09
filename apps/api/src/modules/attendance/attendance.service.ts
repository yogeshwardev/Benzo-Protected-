import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { calculateAttendancePercent, classifyAttendance } from "@benzo/shared";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async recordJoin(user: CurrentUser, liveClassId: string) {
    const liveClass = await this.getLiveClass(liveClassId);
    await this.assertCanAttend(user, liveClass.courseId);

    return this.prisma.attendanceSession.create({
      data: {
        liveClassId,
        userId: user.id,
        joinedAt: new Date(),
        source: "LIVEKIT"
      }
    });
  }

  async recordLeave(user: CurrentUser, liveClassId: string) {
    await this.getLiveClass(liveClassId);
    const openSession = await this.prisma.attendanceSession.findFirst({
      where: {
        liveClassId,
        userId: user.id,
        leftAt: null
      },
      orderBy: { joinedAt: "desc" }
    });

    if (!openSession) {
      throw new NotFoundException("Open attendance session not found.");
    }

    return this.prisma.attendanceSession.update({
      where: { id: openSession.id },
      data: { leftAt: new Date() }
    });
  }

  async summarizeLiveClass(user: CurrentUser, liveClassId: string) {
    const liveClass = await this.getLiveClass(liveClassId);
    await this.access.assertCanManageCourse(user, liveClass.courseId);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { liveClassId },
      orderBy: { joinedAt: "asc" }
    });
    const byUser = new Map<string, typeof sessions>();

    for (const session of sessions) {
      byUser.set(session.userId, [...(byUser.get(session.userId) ?? []), session]);
    }

    const scheduledSeconds = Math.max(
      0,
      Math.floor((liveClass.endsAt.getTime() - liveClass.startsAt.getTime()) / 1000)
    );
    const summaries = [];

    for (const [userId, userSessions] of byUser.entries()) {
      const attendedSeconds = this.calculateOfficialPresenceSeconds(
        userSessions,
        liveClass.startsAt,
        liveClass.endsAt
      );
      const percent = calculateAttendancePercent(attendedSeconds, scheduledSeconds);
      const state = classifyAttendance(attendedSeconds, scheduledSeconds);

      summaries.push(
        await this.prisma.attendanceSummary.upsert({
          where: {
            liveClassId_userId: {
              liveClassId,
              userId
            }
          },
          update: {
            attendedSeconds,
            scheduledSeconds,
            percent,
            state
          },
          create: {
            liveClassId,
            userId,
            attendedSeconds,
            scheduledSeconds,
            percent,
            state
          }
        })
      );
    }

    return summaries;
  }

  async listClassAttendance(user: CurrentUser, liveClassId: string) {
    const liveClass = await this.getLiveClass(liveClassId);
    await this.access.assertCanManageCourse(user, liveClass.courseId);

    return this.prisma.attendanceSummary.findMany({
      where: { liveClassId },
      orderBy: { percent: "desc" }
    });
  }

  private async getLiveClass(liveClassId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: liveClassId }
    });

    if (!liveClass) {
      throw new NotFoundException("Live class not found.");
    }

    return liveClass;
  }

  private async assertCanAttend(user: CurrentUser, courseId: string) {
    if (user.role === "INSTRUCTOR") {
      await this.access.assertCanManageCourse(user, courseId);
      return;
    }

    if (user.role === "STUDENT") {
      await this.access.getActiveStudentEnrollment(user.id, courseId);
      return;
    }

    throw new ForbiddenException("User cannot attend this live class.");
  }

  private calculateOfficialPresenceSeconds(
    sessions: Array<{ joinedAt: Date; leftAt: Date | null }>,
    startsAt: Date,
    endsAt: Date
  ) {
    const now = new Date();
    const ranges = sessions
      .map((session) => ({
        start: Math.max(session.joinedAt.getTime(), startsAt.getTime()),
        end: Math.min((session.leftAt ?? now).getTime(), endsAt.getTime())
      }))
      .filter((range) => range.end > range.start)
      .sort((a, b) => a.start - b.start);

    let totalMs = 0;
    let currentStart: number | null = null;
    let currentEnd: number | null = null;

    for (const range of ranges) {
      if (currentStart === null || currentEnd === null) {
        currentStart = range.start;
        currentEnd = range.end;
        continue;
      }

      if (range.start <= currentEnd) {
        currentEnd = Math.max(currentEnd, range.end);
      } else {
        totalMs += currentEnd - currentStart;
        currentStart = range.start;
        currentEnd = range.end;
      }
    }

    if (currentStart !== null && currentEnd !== null) {
      totalMs += currentEnd - currentStart;
    }

    return Math.floor(totalMs / 1000);
  }
}

