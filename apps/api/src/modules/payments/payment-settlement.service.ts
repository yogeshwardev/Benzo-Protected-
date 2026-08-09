import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Tx = Prisma.TransactionClient;

@Injectable()
export class PaymentSettlementService {
  constructor(private readonly prisma: PrismaService) {}

  async settlePaidOrder(orderId: string, providerPaymentId: string, method?: string) {
    return this.prisma.$transaction((tx) =>
      this.settlePaidOrderTx(tx, {
        orderId,
        providerPaymentId,
        method
      })
    );
  }

  async settlePaidOrderTx(
    tx: Tx,
    input: { orderId: string; providerPaymentId: string; method?: string }
  ) {
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: {
        student: true,
        enrollment: true
      }
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (order.status === "PAID") {
      return order;
    }

    if (!["CREATED", "PENDING"].includes(order.status)) {
      throw new ConflictException("Order cannot be marked paid from its current state.");
    }

    await tx.payment.upsert({
      where: { providerPaymentId: input.providerPaymentId },
      update: {
        status: "CAPTURED",
        capturedAt: new Date()
      },
      create: {
        orderId: order.id,
        provider: input.method === "INTERNAL" ? "INTERNAL" : "RAZORPAY",
        providerPaymentId: input.providerPaymentId,
        status: "CAPTURED",
        amountInPaise: order.finalAmountInPaise,
        method: input.method,
        capturedAt: new Date()
      }
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    });

    await tx.enrollment.upsert({
      where: { orderId: order.id },
      update: { active: true },
      create: {
        orderId: order.id,
        studentId: order.studentId,
        courseId: order.courseId,
        active: true
      }
    });

    await tx.walletTransaction.updateMany({
      where: {
        type: "PURCHASE_DEBIT",
        referenceType: "ORDER",
        referenceId: order.id,
        status: "PENDING"
      },
      data: { status: "SETTLED" }
    });

    if (order.couponId && order.couponDiscountInPaise > 0) {
      await tx.couponRedemption.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          couponId: order.couponId,
          orderId: order.id,
          studentId: order.studentId
        }
      });
    }

    if (order.referralDiscountInPaise > 0) {
      const referral = await tx.referral.findUnique({
        where: { referredId: order.studentId },
        include: {
          referrer: {
            select: { userId: true }
          }
        }
      });

      if (referral?.status === "PENDING") {
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            status: "COMPLETED",
            qualifyingOrderId: order.id,
            completedAt: new Date()
          }
        });

        await tx.walletTransaction.upsert({
          where: {
            type_referenceType_referenceId: {
              type: "REFERRAL_CREDIT",
              referenceType: "REFERRAL",
              referenceId: referral.id
            }
          },
          update: {},
          create: {
            userId: referral.referrer.userId,
            amountInPaise: BENZO.referralCreditInPaise,
            type: "REFERRAL_CREDIT",
            status: "SETTLED",
            referenceType: "REFERRAL",
            referenceId: referral.id
          }
        });
      }
    }

    await tx.invoice.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        invoiceNo: `BZ-INV-${new Date().getFullYear()}-${order.id.slice(-8).toUpperCase()}`
      }
    });

    await tx.auditLog.create({
      data: {
        action: "ORDER_PAID",
        entity: "Order",
        entityId: order.id,
        metadata: {
          providerPaymentId: input.providerPaymentId,
          finalAmountInPaise: order.finalAmountInPaise
        }
      }
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        enrollment: true,
        invoice: true,
        payments: true
      }
    });
  }
}
