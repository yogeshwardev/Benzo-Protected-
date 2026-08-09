import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateRecordingDto } from "./dto/create-recording.dto";

@Injectable()
export class RecordingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async listCourseRecordings(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.recording.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        lessonId: true,
        liveClassId: true,
        provider: true,
        providerVideoId: true,
        durationSeconds: true,
        thumbnailUrl: true,
        status: true,
        createdAt: true
      }
    });
  }

  async getPlaybackMetadata(user: CurrentUser, id: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id },
      select: {
        id: true,
        courseId: true,
        provider: true,
        providerVideoId: true,
        durationSeconds: true,
        thumbnailUrl: true,
        status: true
      }
    });

    if (!recording) {
      throw new NotFoundException("Recording not found.");
    }

    await this.access.assertCanReadCourse(user, recording.courseId);

    return {
      ...recording,
      playbackProvider: "BUNNY_STREAM",
      accessMode: "CONTROLLED_STREAMING"
    };
  }

  async createRecording(user: CurrentUser, dto: CreateRecordingDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);
    await this.assertLessonBelongsToCourse(dto.lessonId, dto.courseId);
    await this.assertLiveClassBelongsToCourse(dto.liveClassId, dto.courseId);

    return this.prisma.recording.create({
      data: {
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        liveClassId: dto.liveClassId,
        providerVideoId: dto.providerVideoId,
        durationSeconds: dto.durationSeconds,
        thumbnailUrl: dto.thumbnailUrl,
        status: dto.status ?? "PENDING"
      }
    });
  }

  private async assertLessonBelongsToCourse(lessonId: string | undefined, courseId: string) {
    if (!lessonId) {
      return;
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (!lesson) {
      throw new NotFoundException("Lesson not found.");
    }

    if (lesson.courseId !== courseId) {
      throw new BadRequestException("Lesson does not belong to this course.");
    }
  }

  private async assertLiveClassBelongsToCourse(liveClassId: string | undefined, courseId: string) {
    if (!liveClassId) {
      return;
    }

    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: { courseId: true }
    });

    if (!liveClass) {
      throw new NotFoundException("Live class not found.");
    }

    if (liveClass.courseId !== courseId) {
      throw new BadRequestException("Live class does not belong to this course.");
    }
  }
}

