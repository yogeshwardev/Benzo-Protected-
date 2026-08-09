import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import Razorpay = require("razorpay");

interface RazorpayOrderResponse {
  id: string;
  amount: number | string;
  currency: string;
  receipt: string;
  status: string;
}

@Injectable()
export class RazorpayService {
  private static readonly minimumAmountInPaise = 100;

  constructor(private readonly config: ConfigService) {}

  async createOrder(input: { amountInPaise: number; receipt: string; notes?: Record<string, string> }) {
    const keyId = this.config.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");

    if (!Number.isInteger(input.amountInPaise) || input.amountInPaise < RazorpayService.minimumAmountInPaise) {
      throw new BadRequestException("Razorpay amount must be at least 100 paise.");
    }

    if (!keyId || !keySecret) {
      if (this.isProduction()) {
        throw new ServiceUnavailableException("Razorpay is not configured.");
      }

      return {
        id: `order_dev_${input.receipt}`,
        amount: input.amountInPaise,
        currency: "INR",
        receipt: input.receipt,
        status: "created"
      };
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      const order = (await razorpay.orders.create({
        amount: input.amountInPaise,
        currency: "INR",
        receipt: input.receipt,
        notes: input.notes
      })) as RazorpayOrderResponse;

      return {
        ...order,
        amount: Number(order.amount)
      };
    } catch (error) {
      if (this.isAuthFailure(error)) {
        throw new UnauthorizedException("Razorpay authentication failed.");
      }

      throw new BadGatewayException("Razorpay order creation failed.");
    }
  }

  verifyPaymentSignature(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");

    if (!keySecret) {
      if (this.isProduction()) {
        throw new ServiceUnavailableException("Razorpay is not configured.");
      }

      return true;
    }

    return this.safeCompare(
      createHmac("sha256", keySecret)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex"),
      input.razorpaySignature
    );
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string | undefined) {
    const webhookSecret = this.config.get<string>("RAZORPAY_WEBHOOK_SECRET");

    if (!webhookSecret) {
      if (this.isProduction()) {
        throw new ServiceUnavailableException("Razorpay webhook secret is not configured.");
      }

      return true;
    }

    if (!signature) {
      return false;
    }

    return this.safeCompare(createHmac("sha256", webhookSecret).update(rawBody).digest("hex"), signature);
  }

  getPublicKey() {
    return this.config.get<string>("RAZORPAY_KEY_ID", "rzp_test_development");
  }

  private safeCompare(expected: string, actual: string) {
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);

    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  }

  private isProduction() {
    return this.config.get<string>("NODE_ENV", "development") === "production";
  }

  private isAuthFailure(error: unknown) {
    if (!error || typeof error !== "object") {
      return false;
    }

    const candidate = error as { statusCode?: unknown; status?: unknown; response?: { status?: unknown } };
    return candidate.statusCode === 401 || candidate.status === 401 || candidate.response?.status === 401;
  }
}
