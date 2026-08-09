import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateMaterialDto } from "./dto/create-material.dto";

@Injectable()
export class MaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async listCourseMaterials(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.material.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        lessonId: true,
        mimeType: true,
        sizeBytes: true,
        private: true,
        createdAt: true
      }
    });
  }

  async createMaterial(user: CurrentUser, dto: CreateMaterialDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);
    await this.assertLessonBelongsToCourse(dto.lessonId, dto.courseId);

    return this.prisma.material.create({
      data: {
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        title: dto.title,
        r2Key: dto.r2Key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        private: dto.private ?? true
      },
      select: {
        id: true,
        courseId: true,
        lessonId: true,
        title: true,
        mimeType: true,
        sizeBytes: true,
        private: true,
        createdAt: true
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
}

