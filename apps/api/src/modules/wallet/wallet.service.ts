import { Injectable } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWalletForUser(userId: string) {
    const [settled, pending, transactions] = await Promise.all([
      this.prisma.walletTransaction.aggregate({
        where: { userId, status: "SETTLED" },
        _sum: { amountInPaise: true }
      }),
      this.prisma.walletTransaction.aggregate({
        where: { userId, status: "PENDING" },
        _sum: { amountInPaise: true }
      }),
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ]);

    const balanceInPaise = settled._sum.amountInPaise ?? 0;

    return {
      balanceInPaise,
      pendingInPaise: pending._sum.amountInPaise ?? 0,
      minimumWithdrawalInPaise: BENZO.minimumWithdrawalInPaise,
      withdrawalEligible: balanceInPaise >= BENZO.minimumWithdrawalInPaise,
      transactions
    };
  }

  listRecentTransactions() {
    return this.prisma.walletTransaction.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
  }
}

