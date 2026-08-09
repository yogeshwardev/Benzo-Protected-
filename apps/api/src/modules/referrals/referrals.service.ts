import { Injectable, NotFoundException } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentReferrals(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, referralCode: true }
    });

    if (!student) {
      throw new NotFoundException("Student profile not found.");
    }

    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        referred: {
          include: {
            user: { select: { name: true, email: true, status: true } }
          }
        },
        qualifyingOrder: {
          select: {
            id: true,
            finalAmountInPaise: true,
            createdAt: true
          }
        }
      }
    });

    return {
      referralCode: student.referralCode,
      referredStudentDiscountInPaise: BENZO.referralDiscountInPaise,
      referrerCreditInPaise: BENZO.referralCreditInPaise,
      referrals
    };
  }

  listReferralsForAdmin() {
    return this.prisma.referral.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        referrer: { include: { user: { select: { name: true, email: true } } } },
        referred: { include: { user: { select: { name: true, email: true } } } },
        qualifyingOrder: true
      }
    });
  }
}

