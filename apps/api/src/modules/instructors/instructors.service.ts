import { ConflictException, Injectable } from "@nestjs/common";
import { AccountStatus } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateInstructorDto } from "./dto/create-instructor.dto";

const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

@Injectable()
export class InstructorsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createInstructor(dto: CreateInstructorDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException("An account already exists for this email.");
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          mobile: dto.mobile,
          name: dto.name,
          role: "INSTRUCTOR",
          status: AccountStatus.PENDING_ACTIVATION,
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
  }
}

