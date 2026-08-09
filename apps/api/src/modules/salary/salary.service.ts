import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../../common/access/course-access.service";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { ApproveSalaryItemDto } from "./dto/approve-salary-item.dto";
import type { CreateSalaryPayoutDto } from "./dto/create-salary-payout.dto";
import type { RejectSalaryItemDto } from "./dto/reject-salary-item.dto";

@Injectable()
export class SalaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CourseAccessService
  ) {}

  async generateSalaryItem(user: CurrentUser, liveClassId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: liveClassId },
      include: {
        course: {
          include: {
            assignments: {
              where: { active: true },
              include: {
                instructor: {
                  include: {
                    user: { select: { id: true, name: true, email: true } }
                  }
                }
              },
              take: 1
            }
          }
        }
      }
    });

    if (!liveClass) {
      throw new NotFoundException("Live class not found.");
    }

    await this.access.assertCanManageCourse(user, liveClass.courseId);
    const instructor = liveClass.course.assignments[0]?.instructor;

    if (!instructor) {
      throw new NotFoundException("Active instructor not found for this course.");
    }

    if (user.role === "INSTRUCTOR" && instructor.userId !== user.id) {
      throw new ForbiddenException("Instructor cannot generate salary for another instructor.");
    }

    const summary = await this.prisma.attendanceSummary.findUnique({
      where: {
        liveClassId_userId: {
          liveClassId,
          userId: instructor.userId
        }
      }
    });
    const scheduledSeconds =
      summary?.scheduledSeconds ??
      Math.max(0, Math.floor((liveClass.endsAt.getTime() - liveClass.startsAt.getTime()) / 1000));
    const attendedSeconds = summary?.attendedSeconds ?? 0;
    const attendancePercent = summary?.percent ?? 0;
    const amountInPaise = attendancePercent >= 80 ? instructor.perClassSalary : 0;
    const existing = await this.prisma.instructorSalaryItem.findUnique({
      where: {
        instructorId_liveClassId: {
          instructorId: instructor.id,
          liveClassId
        }
      }
    });

    if (existing?.status === "APPROVED" || existing?.status === "PAID") {
      return existing;
    }

    if (existing) {
      return this.prisma.instructorSalaryItem.update({
        where: { id: existing.id },
        data: {
          amountInPaise,
          attendedSeconds,
          scheduledSeconds,
          attendancePercent,
          status: "PENDING",
          rejectionReason: null,
          approvedAt: null
        },
        include: this.salaryItemInclude()
      });
    }

    return this.prisma.instructorSalaryItem.create({
      data: {
        instructorId: instructor.id,
        liveClassId,
        amountInPaise,
        attendedSeconds,
        scheduledSeconds,
        attendancePercent,
        status: "PENDING"
      },
      include: this.salaryItemInclude()
    });
  }

  listInstructorItems(userId: string) {
    return this.prisma.instructorSalaryItem.findMany({
      where: { instructor: { userId } },
      orderBy: { createdAt: "desc" },
      include: this.salaryItemInclude()
    });
  }

  listInstructorPayouts(userId: string) {
    return this.prisma.instructorSalaryPayout.findMany({
      where: { instructor: { userId } },
      orderBy: { paidAt: "desc" },
      include: {
        items: { include: this.salaryItemInclude() }
      }
    });
  }

  listInstructorAttendance(userId: string) {
    return this.prisma.attendanceSummary.findMany({
      where: {
        liveClass: {
          course: {
            assignments: {
              some: {
                active: true,
                instructor: { userId }
              }
            }
          }
        },
        userId
      },
      orderBy: { calculatedAt: "desc" },
      include: {
        liveClass: {
          include: { course: { select: { title: true, slug: true } } }
        }
      }
    });
  }

  listItemsForAdmin() {
    return this.prisma.instructorSalaryItem.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: this.salaryItemInclude()
    });
  }

  listPayoutsForAdmin() {
    return this.prisma.instructorSalaryPayout.findMany({
      take: 100,
      orderBy: { paidAt: "desc" },
      include: {
        instructor: {
          include: { user: { select: { name: true, email: true } } }
        },
        items: { include: this.salaryItemInclude() }
      }
    });
  }

  async listInstructorAttendanceForAdmin() {
    const instructorUsers = await this.prisma.instructorProfile.findMany({
      select: { userId: true }
    });

    return this.prisma.attendanceSummary.findMany({
      where: {
        userId: { in: instructorUsers.map((instructor) => instructor.userId) },
        liveClass: {
          course: {
            assignments: {
              some: { active: true }
            }
          }
        }
      },
      take: 200,
      orderBy: { calculatedAt: "desc" },
      include: {
        liveClass: {
          include: {
            course: {
              include: {
                assignments: {
                  where: { active: true },
                  include: { instructor: { include: { user: { select: { name: true, email: true } } } } },
                  take: 1
                }
              }
            }
          }
        }
      }
    });
  }

  async approveItem(actorId: string, id: string, dto: ApproveSalaryItemDto) {
    const item = await this.getSalaryItem(id);

    if (item.status === "PAID") {
      throw new ConflictException("Paid salary item cannot be changed.");
    }

    const approved = await this.prisma.instructorSalaryItem.update({
      where: { id },
      data: {
        amountInPaise: dto.amountInPaise ?? item.amountInPaise,
        status: "APPROVED",
        approvedAt: new Date(),
        rejectionReason: null
      },
      include: this.salaryItemInclude()
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: "SALARY_ITEM_APPROVED",
        entity: "InstructorSalaryItem",
        entityId: id,
        metadata: { amountInPaise: approved.amountInPaise }
      }
    });

    return approved;
  }

  async rejectItem(actorId: string, id: string, dto: RejectSalaryItemDto) {
    const item = await this.getSalaryItem(id);

    if (item.status === "PAID") {
      throw new ConflictException("Paid salary item cannot be changed.");
    }

    const rejected = await this.prisma.instructorSalaryItem.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedAt: null,
        rejectionReason: dto.reason
      },
      include: this.salaryItemInclude()
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: "SALARY_ITEM_REJECTED",
        entity: "InstructorSalaryItem",
        entityId: id,
        metadata: { reason: dto.reason }
      }
    });

    return rejected;
  }

  async createPayout(actorId: string, dto: CreateSalaryPayoutDto) {
    const items = await this.prisma.instructorSalaryItem.findMany({
      where: {
        id: { in: dto.salaryItemIds },
        instructorId: dto.instructorId
      }
    });

    if (items.length !== dto.salaryItemIds.length) {
      throw new NotFoundException("One or more salary items were not found.");
    }

    if (items.some((item) => item.status !== "APPROVED" || item.payoutId)) {
      throw new ConflictException("Only approved unpaid salary items can be paid out.");
    }

    const amountInPaise = items.reduce((total, item) => total + item.amountInPaise, 0);

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.instructorSalaryPayout.create({
        data: {
          instructorId: dto.instructorId,
          amountInPaise,
          paymentReference: dto.paymentReference,
          paidAt: new Date()
        }
      });

      await tx.instructorSalaryItem.updateMany({
        where: { id: { in: dto.salaryItemIds } },
        data: {
          payoutId: payout.id,
          status: "PAID"
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: "SALARY_PAYOUT_CREATED",
          entity: "InstructorSalaryPayout",
          entityId: payout.id,
          metadata: { amountInPaise, salaryItemIds: dto.salaryItemIds }
        }
      });

      return tx.instructorSalaryPayout.findUnique({
        where: { id: payout.id },
        include: {
          instructor: { include: { user: { select: { name: true, email: true } } } },
          items: { include: this.salaryItemInclude() }
        }
      });
    });
  }

  private async getSalaryItem(id: string) {
    const item = await this.prisma.instructorSalaryItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException("Salary item not found.");
    }

    return item;
  }

  private salaryItemInclude() {
    return {
      instructor: { include: { user: { select: { name: true, email: true } } } },
      liveClass: { include: { course: { select: { title: true, slug: true } } } },
      payout: true
    } as const;
  }
}
