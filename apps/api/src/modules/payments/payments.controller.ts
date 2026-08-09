import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentSettlementService } from "./payment-settlement.service";
import { RazorpayService } from "./razorpay.service";
import { VerifyRazorpayPaymentDto } from "./dto/verify-razorpay-payment.dto";

@Controller({ path: "payments", version: "1" })
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settlement: PaymentSettlementService,
    private readonly razorpay: RazorpayService
  ) {}

  @Post("razorpay/verify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("STUDENT")
  async verifyRazorpayPayment(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: VerifyRazorpayPaymentDto
  ) {
    const verified = this.razorpay.verifyPaymentSignature({
      razorpayOrderId: dto.razorpay_order_id,
      razorpayPaymentId: dto.razorpay_payment_id,
      razorpaySignature: dto.razorpay_signature
    });

    if (!verified) {
      throw new UnauthorizedException("Invalid Razorpay payment signature.");
    }

    const order = await this.prisma.order.findFirst({
      where: {
        razorpayOrderId: dto.razorpay_order_id,
        student: { userId: user.id }
      },
      select: { id: true }
    });

    if (!order) {
      throw new UnauthorizedException("Payment does not belong to this student.");
    }

    return this.settlement.settlePaidOrder(order.id, dto.razorpay_payment_id);
  }

  @Post("razorpay/webhook")
  async razorpayWebhook(
    @Headers("x-razorpay-signature") signature: string | undefined,
    @Headers("x-razorpay-event-id") eventId: string | undefined,
    @Body() body: Record<string, unknown>,
    @Req() request: RawBodyRequest<Request>
  ) {
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(body));

    if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException("Invalid Razorpay webhook signature.");
    }

    const providerEventId =
      eventId ?? createHash("sha256").update(rawBody).digest("hex").slice(0, 48);

    try {
      await this.prisma.razorpayWebhookEvent.create({
        data: {
          providerEventId,
          eventType: String(body.event ?? "unknown"),
          payload: body as Prisma.InputJsonValue
        }
      });
    } catch {
      return { received: true, duplicate: true };
    }

    try {
      const payment = this.extractPaymentEntity(body);

      if (payment?.orderId && payment.paymentId && ["payment.captured", "order.paid"].includes(String(body.event))) {
        const order = await this.prisma.order.findUnique({
          where: { razorpayOrderId: payment.orderId },
          select: { id: true }
        });

        if (order) {
          await this.settlement.settlePaidOrder(order.id, payment.paymentId, payment.method);
        }
      }

      await this.prisma.razorpayWebhookEvent.update({
        where: { providerEventId },
        data: { processedAt: new Date() }
      });

      return { received: true };
    } catch (error) {
      await this.prisma.razorpayWebhookEvent.update({
        where: { providerEventId },
        data: {
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : "Unknown webhook processing failure"
        }
      });
      throw error;
    }
  }

  private extractPaymentEntity(body: Record<string, unknown>) {
    const payload = body.payload as
      | {
          payment?: {
            entity?: {
              id?: string;
              order_id?: string;
              method?: string;
            };
          };
          order?: {
            entity?: {
              id?: string;
            };
          };
        }
      | undefined;
    const payment = payload?.payment?.entity;

    return payment
      ? {
          paymentId: payment.id,
          orderId: payment.order_id,
          method: payment.method
        }
      : undefined;
  }
}
