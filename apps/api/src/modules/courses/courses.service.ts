import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateCourseDto } from "./dto/create-course.dto";
import type { UpdateCourseDto } from "./dto/update-course.dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  listPublishedCourses() {
    return this.prisma.course.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        category: true,
        difficulty: true,
        priceInPaise: true,
        thumbnail: true,
        schedules: {
          where: { active: true },
          select: { dayOfWeek: true, startMinute: true, endMinute: true, timezone: true }
        },
        assignments: {
          where: { active: true },
          take: 1,
          select: {
            instructor: {
              select: {
                user: { select: { name: true } },
                qualification: true
              }
            }
          }
        }
      }
    });
  }

  async getCourseBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        schedules: { where: { active: true } },
        assignments: {
          where: { active: true },
          include: {
            instructor: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });

    if (!course || !course.published) {
      throw new NotFoundException("Course not found.");
    }

    return course;
  }

  listCoursesForAdmin() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        schedules: { where: { active: true } },
        assignments: {
          where: { active: true },
          include: {
            instructor: {
              include: {
                user: { select: { name: true, email: true, status: true } }
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            materials: true,
            courseAssignments: true,
            quizzes: true,
            liveClasses: true
          }
        }
      }
    });
  }

  createCourse(dto: CreateCourseDto) {
    this.validateSchedule(dto.schedule);

    return this.prisma.course.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDesc: dto.shortDescription,
        fullDesc: dto.fullDescription,
        thumbnail: dto.thumbnail,
        category: dto.category,
        difficulty: dto.difficulty,
        priceInPaise: dto.priceInPaise,
        requirements: dto.requirements,
        outcomes: dto.outcomes,
        published: dto.published ?? false,
        schedules: dto.schedule
          ? {
              create: {
                dayOfWeek: dto.schedule.dayOfWeek,
                startMinute: dto.schedule.startMinute,
                endMinute: dto.schedule.endMinute,
                timezone: dto.schedule.timezone ?? "Asia/Kolkata"
              }
            }
          : undefined
      }
    });
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    this.validateSchedule(dto.schedule);

    const existing = await this.prisma.course.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new NotFoundException("Course not found.");
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDesc: dto.shortDescription,
        fullDesc: dto.fullDescription,
        thumbnail: dto.thumbnail,
        category: dto.category,
        difficulty: dto.difficulty,
        priceInPaise: dto.priceInPaise,
        requirements: dto.requirements,
        outcomes: dto.outcomes,
        published: dto.published,
        schedules: dto.schedule
          ? {
              updateMany: {
                where: { active: true },
                data: { active: false }
              },
              create: {
                dayOfWeek: dto.schedule.dayOfWeek,
                startMinute: dto.schedule.startMinute,
                endMinute: dto.schedule.endMinute,
                timezone: dto.schedule.timezone ?? "Asia/Kolkata"
              }
            }
          : undefined
      }
    });
  }

  private validateSchedule(schedule: CreateCourseDto["schedule"] | UpdateCourseDto["schedule"]) {
    if (schedule && schedule.endMinute <= schedule.startMinute) {
      throw new BadRequestException("Schedule end time must be after start time.");
    }
  }
}
