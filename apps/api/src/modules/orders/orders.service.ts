import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentSettlementService } from "../payments/payment-settlement.service";
import { RazorpayService } from "../payments/razorpay.service";
import { PricingService } from "../pricing/pricing.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly razorpay: RazorpayService,
    private readonly settlement: PaymentSettlementService
  ) {}

  async createCourseOrder(userId: string, dto: CreateOrderDto) {
    const quote = await this.pricing.quoteForStudent(userId, dto);

    if (quote.finalAmountInPaise < 0) {
      throw new BadRequestException("Final payable amount cannot be negative.");
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          studentId: quote.studentId,
          courseId: quote.course.id,
          couponId: quote.coupon?.id,
          status: "CREATED",
          baseAmountInPaise: quote.baseAmountInPaise,
          couponDiscountInPaise: quote.couponDiscountInPaise,
          referralDiscountInPaise: quote.referralDiscountInPaise,
          walletUsedInPaise: quote.walletUsedInPaise,
          finalAmountInPaise: quote.finalAmountInPaise
        }
      });

      if (quote.referral?.createIfMissing) {
        await tx.referral.create({
          data: {
            referrerId: quote.referral.referrerId,
            referredId: quote.studentId
          }
        });
      }

      if (quote.walletUsedInPaise > 0) {
        await tx.walletTransaction.create({
          data: {
            userId: quote.userId,
            amountInPaise: -quote.walletUsedInPaise,
            type: "PURCHASE_DEBIT",
            status: "PENDING",
            referenceType: "ORDER",
            referenceId: createdOrder.id
          }
        });
      }

      return createdOrder;
    });

    if (order.finalAmountInPaise === 0) {
      const settledOrder = await this.settlement.settlePaidOrder(order.id, `INTERNAL-${order.id}`, "INTERNAL");
      return {
        order: settledOrder,
        payment: {
          provider: "INTERNAL",
          payableInPaise: 0
        }
      };
    }

    const razorpayOrder = await this.razorpay.createOrder({
      amountInPaise: order.finalAmountInPaise,
      receipt: order.id,
      notes: {
        orderId: order.id,
        courseId: quote.course.id,
        studentId: quote.studentId
      }
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true }
        }
      }
    });

    return {
      order: updatedOrder,
      quote,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      payment: {
        provider: "RAZORPAY",
        keyId: this.razorpay.getPublicKey(),
        razorpayOrderId: razorpayOrder.id,
        amountInPaise: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    };
  }

  async listStudentOrders(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!student) {
      return [];
    }

    return this.prisma.order.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true, slug: true } },
        payments: true,
        invoice: true
      }
    });
  }

  async cancelCourseOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        student: { userId }
      },
      select: { id: true, status: true }
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (order.status === "PAID") {
      throw new ConflictException("A paid order cannot be cancelled.");
    }

    if (order.status === "CANCELLED") {
      return { success: true, order };
    }

    if (!["CREATED", "PENDING", "FAILED"].includes(order.status)) {
      throw new ConflictException("Order cannot be cancelled from its current state.");
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      await tx.walletTransaction.updateMany({
        where: {
          type: "PURCHASE_DEBIT",
          referenceType: "ORDER",
          referenceId: order.id,
          status: "PENDING"
        },
        data: { status: "REVERSED" }
      });

      await tx.payment.updateMany({
        where: {
          orderId: order.id,
          status: { in: ["CREATED", "AUTHORIZED"] }
        },
        data: { status: "FAILED" }
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "ORDER_CANCELLED",
          entity: "Order",
          entityId: order.id
        }
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" }
      });
    });

    return { success: true, order: cancelled };
  }

  listOrdersForAdmin() {
    return this.prisma.order.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, mobile: true } }
          }
        },
        course: { select: { title: true, slug: true } },
        payments: true,
        invoice: true
      }
    });
  }
}
