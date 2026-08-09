import { BadGatewayException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

@Injectable()
export class RazorpayService {
  constructor(private readonly config: ConfigService) {}

  async createOrder(input: { amountInPaise: number; receipt: string; notes?: Record<string, string> }) {
    const keyId = this.config.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");

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

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency: "INR",
        receipt: input.receipt,
        notes: input.notes
      })
    });

    if (!response.ok) {
      throw new BadGatewayException("Razorpay order creation failed.");
    }

    return (await response.json()) as RazorpayOrderResponse;
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
}

