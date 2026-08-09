import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateCourseModuleDto } from "./dto/create-course-module.dto";
import type { CreateLessonDto } from "./dto/create-lesson.dto";
import type { UpdateLessonProgressDto } from "./dto/update-lesson-progress.dto";

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async getCourseOutline(user: CurrentUser, courseId: string) {
    await this.access.assertCanReadCourse(user, courseId);

    return this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              include: {
                materials: {
                  select: {
                    id: true,
                    title: true,
                    mimeType: true,
                    sizeBytes: true,
                    private: true
                  }
                },
                recordings: {
                  select: {
                    id: true,
                    provider: true,
                    providerVideoId: true,
                    durationSeconds: true,
                    thumbnailUrl: true,
                    status: true
                  }
                }
              }
            }
          }
        },
        lessons: {
          where: { moduleId: null },
          orderBy: { position: "asc" },
          include: {
            materials: {
              select: {
                id: true,
                title: true,
                mimeType: true,
                sizeBytes: true,
                private: true
              }
            },
            recordings: {
              select: {
                id: true,
                provider: true,
                providerVideoId: true,
                durationSeconds: true,
                thumbnailUrl: true,
                status: true
              }
            }
          }
        }
      }
    });
  }

  async getCourseProgress(user: CurrentUser, courseId: string) {
    const enrollment = await this.access.getActiveStudentEnrollment(user.id, courseId);
    const [lessonCount, completedCount, progress] = await Promise.all([
      this.prisma.lesson.count({ where: { courseId } }),
      this.prisma.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          completed: true
        }
      }),
      this.prisma.lessonProgress.findMany({
        where: { enrollmentId: enrollment.id },
        orderBy: { updatedAt: "desc" },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              courseId: true,
              moduleId: true
            }
          }
        }
      })
    ]);

    return {
      lessonCount,
      completedCount,
      completionPercent: lessonCount === 0 ? 0 : Math.round((completedCount / lessonCount) * 100),
      progress
    };
  }

  async createModule(user: CurrentUser, dto: CreateCourseModuleDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);

    return this.prisma.courseModule.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        position: dto.position
      }
    });
  }

  async createLesson(user: CurrentUser, dto: CreateLessonDto) {
    await this.access.assertCanManageCourse(user, dto.courseId);
    await this.assertModuleBelongsToCourse(dto.moduleId, dto.courseId);

    return this.prisma.lesson.create({
      data: {
        courseId: dto.courseId,
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        position: dto.position,
        durationSeconds: dto.durationSeconds,
        freePreview: dto.freePreview ?? false
      }
    });
  }

  async updateLessonProgress(user: CurrentUser, lessonId: string, dto: UpdateLessonProgressDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true }
    });

    if (!lesson) {
      throw new NotFoundException("Lesson not found.");
    }

    const enrollment = await this.access.getActiveStudentEnrollment(user.id, lesson.courseId);
    const progressPercent = dto.completed ? 100 : (dto.progressPercent ?? 0);
    const completed = dto.completed ?? progressPercent >= 100;

    return this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: lesson.id
        }
      },
      update: {
        progressPercent,
        completed,
        lastPositionSeconds: dto.lastPositionSeconds,
        completedAt: completed ? new Date() : null
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        progressPercent,
        completed,
        lastPositionSeconds: dto.lastPositionSeconds ?? 0,
        completedAt: completed ? new Date() : null
      }
    });
  }

  private async assertModuleBelongsToCourse(moduleId: string | undefined, courseId: string) {
    if (!moduleId) {
      return;
    }

    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });

    if (!module) {
      throw new NotFoundException("Course module not found.");
    }

    if (module.courseId !== courseId) {
      throw new BadRequestException("Course module does not belong to this course.");
    }
  }
}

