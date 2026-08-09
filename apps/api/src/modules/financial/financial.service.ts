import { Injectable } from "@nestjs/common";
import type { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { FinancialQueryDto } from "./dto/financial-query.dto";

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: FinancialQueryDto) {
    const where = this.buildWhere(query);
    const [paid, failed, refunded] = await Promise.all([
      this.prisma.order.aggregate({
        where: { ...where, status: "PAID" },
        _sum: {
          baseAmountInPaise: true,
          couponDiscountInPaise: true,
          referralDiscountInPaise: true,
          walletUsedInPaise: true,
          finalAmountInPaise: true
        },
        _count: true
      }),
      this.prisma.order.count({
        where: { ...where, status: "FAILED" }
      }),
      this.prisma.order.aggregate({
        where: { ...where, status: "REFUNDED" },
        _sum: { finalAmountInPaise: true },
        _count: true
      })
    ]);

    const couponDiscountsInPaise = paid._sum.couponDiscountInPaise ?? 0;
    const referralDiscountsInPaise = paid._sum.referralDiscountInPaise ?? 0;
    const walletUsedInPaise = paid._sum.walletUsedInPaise ?? 0;
    const refundsInPaise = refunded._sum.finalAmountInPaise ?? 0;

    return {
      grossSalesInPaise: paid._sum.baseAmountInPaise ?? 0,
      totalDiscountsInPaise: couponDiscountsInPaise + referralDiscountsInPaise + walletUsedInPaise,
      couponDiscountsInPaise,
      referralDiscountsInPaise,
      walletUsedInPaise,
      refundsInPaise,
      netRevenueInPaise: (paid._sum.finalAmountInPaise ?? 0) - refundsInPaise,
      successfulPayments: paid._count,
      failedPayments: failed,
      refundedPayments: refunded._count
    };
  }

  listPayments(query: FinancialQueryDto) {
    return this.prisma.order.findMany({
      where: this.buildWhere(query),
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, mobile: true } }
          }
        },
        course: { select: { title: true, slug: true } },
        payments: true,
        coupon: { select: { code: true } },
        invoice: true
      }
    });
  }

  async exportPaymentsCsv(query: FinancialQueryDto) {
    const rows = await this.listPayments(query);
    const header = [
      "Student",
      "Email",
      "Course",
      "Order ID",
      "Base Price",
      "Coupon Discount",
      "Referral Discount",
      "Wallet Used",
      "Final Amount",
      "Razorpay Payment ID",
      "Status",
      "Date",
      "Invoice"
    ];
    const body = rows.map((order) => [
      order.student.user.name,
      order.student.user.email,
      order.course.title,
      order.id,
      order.baseAmountInPaise,
      order.couponDiscountInPaise,
      order.referralDiscountInPaise,
      order.walletUsedInPaise,
      order.finalAmountInPaise,
      order.payments.find((payment) => payment.provider === "RAZORPAY")?.providerPaymentId ?? "",
      order.status,
      order.createdAt.toISOString(),
      order.invoice?.invoiceNo ?? ""
    ]);

    return [header, ...body].map((row) => row.map(this.csvCell).join(",")).join("\n");
  }

  private buildWhere(query: FinancialQueryDto): Prisma.OrderWhereInput {
    const createdAt = this.resolveDateFilter(query);

    return {
      ...(createdAt ? { createdAt } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status as OrderStatus } : {})
    };
  }

  private resolveDateFilter(query: FinancialQueryDto): Prisma.DateTimeFilter | undefined {
    if (query.dateFrom || query.dateTo) {
      return {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {})
      };
    }

    if (!query.preset) {
      return undefined;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

    if (query.preset === "today") {
      return { gte: startOfToday, lte: endOfToday };
    }

    if (query.preset === "yesterday") {
      const start = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const end = new Date(startOfToday.getTime() - 1);
      return { gte: start, lte: end };
    }

    if (query.preset === "last7") {
      return { gte: new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000), lte: endOfToday };
    }

    if (query.preset === "last30") {
      return { gte: new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000), lte: endOfToday };
    }

    return {
      gte: new Date(now.getFullYear(), now.getMonth(), 1),
      lte: endOfToday
    };
  }

  private csvCell(value: string | number) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }
}

