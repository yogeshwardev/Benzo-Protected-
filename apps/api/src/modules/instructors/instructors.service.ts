import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { customAlphabet } from "nanoid";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateInstructorDto } from "./dto/create-instructor.dto";

const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

@Injectable()
export class InstructorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  listInstructors() {
    return this.prisma.instructorProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, mobile: true, status: true }
        },
        assignments: {
          where: { active: true },
          include: { course: { select: { id: true, title: true, slug: true } } }
        }
      }
    });
  }

  async getMyProfile(userId: string) {
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, status: true } },
        assignments: {
          where: { active: true },
          include: {
            course: {
              include: {
                schedules: { where: { active: true } },
                _count: { select: { enrollments: true, lessons: true, materials: true, quizzes: true } }
              }
            }
          }
        }
      }
    });

    if (!instructor) {
      throw new NotFoundException("Instructor profile not found.");
    }

    return instructor;
  }

  async createInstructor(dto: CreateInstructorDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException("An account already exists for this email.");
    }

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: {
        id: true,
        assignments: {
          where: { active: true },
          select: { id: true }
        }
      }
    });

    if (!course) {
      throw new NotFoundException("Course not found.");
    }

    if (course.assignments.length > 0) {
      throw new ConflictException("This course already has an active instructor.");
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          mobile: dto.mobile,
          name: dto.name,
          role: "INSTRUCTOR",
          status: dto.temporaryPassword ? AccountStatus.ACTIVE : AccountStatus.PENDING_ACTIVATION,
          passwordHash: dto.temporaryPassword ? await argon2.hash(dto.temporaryPassword) : undefined,
          instructorProfile: {
            create: {
              instructorCode: `BZ-INS-${codeAlphabet()}`,
              qualification: dto.qualification,
              perClassSalary: dto.perClassSalaryInPaise,
              joiningDate: new Date(dto.joiningDate),
              bankMasked: dto.bankMasked
            }
          }
        },
        include: { instructorProfile: true }
      });

      await tx.courseInstructorAssignment.create({
        data: {
          courseId: dto.courseId,
          instructorId: user.instructorProfile!.id
        }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      };
    });

    return {
      user,
      activation: dto.temporaryPassword ? undefined : await this.authService.createPasswordSetupToken(user.id)
    };
  }
}
