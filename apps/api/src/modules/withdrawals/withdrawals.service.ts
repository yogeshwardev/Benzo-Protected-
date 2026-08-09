import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateWithdrawalDto } from "./dto/create-withdrawal.dto";
import type { MarkWithdrawalPaidDto } from "./dto/mark-withdrawal-paid.dto";
import type { RejectWithdrawalDto } from "./dto/reject-withdrawal.dto";

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    if (dto.amountInPaise < BENZO.minimumWithdrawalInPaise) {
      throw new BadRequestException("Withdrawal amount is below the minimum withdrawal limit.");
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true }
    });

    if (!student) {
      throw new NotFoundException("Student profile not found.");
    }

    const availableBalance = await this.getAvailableWalletBalance(student.userId);

    if (dto.amountInPaise > availableBalance) {
      throw new BadRequestException("Withdrawal amount exceeds available wallet balance.");
    }

    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          studentId: student.id,
          amountInPaise: dto.amountInPaise,
          bankMasked: dto.bankMasked,
          status: "PENDING"
        }
      });

      await tx.walletTransaction.create({
        data: {
          userId: student.userId,
          amountInPaise: -dto.amountInPaise,
          type: "WITHDRAWAL_RESERVE",
          status: "PENDING",
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id
        }
      });

      return withdrawal;
    });
  }

  async listStudentWithdrawals(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!student) {
      return [];
    }

    return this.prisma.withdrawalRequest.findMany({
      where: { studentId: student.id },
      orderBy: { requestedAt: "desc" }
    });
  }

  listWithdrawalsForAdmin() {
    return this.prisma.withdrawalRequest.findMany({
      take: 100,
      orderBy: { requestedAt: "desc" },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, mobile: true } }
          }
        }
      }
    });
  }

  async markPaid(actorId: string, id: string, dto: MarkWithdrawalPaidDto) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal request not found.");
    }

    if (withdrawal.status !== "PENDING") {
      throw new ConflictException("Only pending withdrawals can be marked paid.");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.walletTransaction.updateMany({
        where: {
          type: "WITHDRAWAL_RESERVE",
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id,
          status: "PENDING"
        },
        data: { status: "REVERSED" }
      });

      await tx.walletTransaction.create({
        data: {
          userId: withdrawal.student.userId,
          amountInPaise: -withdrawal.amountInPaise,
          type: "WITHDRAWAL_DEBIT",
          status: "SETTLED",
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: "WITHDRAWAL_PAID",
          entity: "WithdrawalRequest",
          entityId: withdrawal.id,
          metadata: { adminReference: dto.adminReference, amountInPaise: withdrawal.amountInPaise }
        }
      });

      return tx.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: {
          status: "PAID",
          adminReference: dto.adminReference,
          resolvedAt: new Date()
        }
      });
    });
  }

  async reject(actorId: string, id: string, dto: RejectWithdrawalDto) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!withdrawal) {
      throw new NotFoundException("Withdrawal request not found.");
    }

    if (withdrawal.status !== "PENDING") {
      throw new ConflictException("Only pending withdrawals can be rejected.");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.walletTransaction.updateMany({
        where: {
          type: "WITHDRAWAL_RESERVE",
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id,
          status: "PENDING"
        },
        data: { status: "REVERSED" }
      });

      await tx.walletTransaction.create({
        data: {
          userId: withdrawal.student.userId,
          amountInPaise: 0,
          type: "WITHDRAWAL_REVERSAL",
          status: "SETTLED",
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: "WITHDRAWAL_REJECTED",
          entity: "WithdrawalRequest",
          entityId: withdrawal.id,
          metadata: { reason: dto.reason, amountInPaise: withdrawal.amountInPaise }
        }
      });

      return tx.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: {
          status: "REJECTED",
          rejectionReason: dto.reason,
          resolvedAt: new Date()
        }
      });
    });
  }

  private async getAvailableWalletBalance(userId: string) {
    const result = await this.prisma.walletTransaction.aggregate({
      where: {
        userId,
        OR: [{ status: "SETTLED" }, { status: "PENDING", amountInPaise: { lt: 0 } }]
      },
      _sum: { amountInPaise: true }
    });

    return Math.max(0, result._sum.amountInPaise ?? 0);
  }
}
