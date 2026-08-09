import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BENZO } from "@benzo/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { CheckoutQuoteDto } from "./dto/checkout-quote.dto";

export interface CheckoutQuote {
  studentId: string;
  userId: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  baseAmountInPaise: number;
  couponDiscountInPaise: number;
  referralDiscountInPaise: number;
  walletBalanceInPaise: number;
  walletUsedInPaise: number;
  finalAmountInPaise: number;
  coupon?: {
    id: string;
    code: string;
  };
  referral?: {
    id?: string;
    referrerId: string;
    createIfMissing: boolean;
  };
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async quoteForStudent(userId: string, dto: CheckoutQuoteDto): Promise<CheckoutQuote> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, referralCode: true }
    });

    if (!student) {
      throw new NotFoundException("Student profile not found.");
    }

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        priceInPaise: true,
        published: true,
        enrollments: {
          where: { studentId: student.id, active: true },
          select: { id: true },
          take: 1
        }
      }
    });

    if (!course || !course.published) {
      throw new NotFoundException("Course not found.");
    }

    if (course.enrollments.length > 0) {
      throw new ConflictException("Student is already enrolled in this course.");
    }

    const coupon = await this.resolveCoupon(dto.couponCode, course.priceInPaise);
    const referral = await this.resolveReferral(student.id, dto.referralCode);
    const remainingAfterDiscounts = Math.max(
      0,
      course.priceInPaise - coupon.discountInPaise - referral.discountInPaise
    );
    const walletBalanceInPaise = await this.getAvailableWalletBalance(student.userId);
    const requestedWallet = dto.walletAmountInPaise ?? 0;

    if (requestedWallet > walletBalanceInPaise) {
      throw new BadRequestException("Requested wallet amount exceeds available balance.");
    }

    const walletUsedInPaise = Math.min(requestedWallet, remainingAfterDiscounts);

    return {
      studentId: student.id,
      userId: student.userId,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug
      },
      baseAmountInPaise: course.priceInPaise,
      couponDiscountInPaise: coupon.discountInPaise,
      referralDiscountInPaise: referral.discountInPaise,
      walletBalanceInPaise,
      walletUsedInPaise,
      finalAmountInPaise: remainingAfterDiscounts - walletUsedInPaise,
      coupon: coupon.coupon,
      referral: referral.referral
    };
  }

  private async resolveCoupon(couponCode: string | undefined, baseAmountInPaise: number) {
    if (!couponCode) {
      return { discountInPaise: 0 };
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() }
    });
    const now = new Date();

    if (
      !coupon ||
      !coupon.active ||
      (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.endsAt && coupon.endsAt < now)
    ) {
      throw new BadRequestException("Coupon is not valid.");
    }

    const percentDiscount = coupon.discountPercent
      ? Math.floor((baseAmountInPaise * coupon.discountPercent) / 100)
      : 0;
    const fixedDiscount = coupon.discountInPaise ?? 0;
    const cappedDiscount = coupon.maxDiscountInPaise
      ? Math.min(percentDiscount + fixedDiscount, coupon.maxDiscountInPaise)
      : percentDiscount + fixedDiscount;

    return {
      discountInPaise: Math.min(baseAmountInPaise, cappedDiscount),
      coupon: {
        id: coupon.id,
        code: coupon.code
      }
    };
  }

  private async resolveReferral(studentId: string, referralCode: string | undefined) {
    const existingReferral = await this.prisma.referral.findUnique({
      where: { referredId: studentId },
      select: { id: true, referrerId: true, status: true }
    });

    if (existingReferral?.status === "COMPLETED") {
      return { discountInPaise: 0 };
    }

    if (existingReferral?.status === "PENDING") {
      return {
        discountInPaise: BENZO.referralDiscountInPaise,
        referral: {
          id: existingReferral.id,
          referrerId: existingReferral.referrerId,
          createIfMissing: false
        }
      };
    }

    if (!referralCode) {
      return { discountInPaise: 0 };
    }

    const referrer = await this.prisma.studentProfile.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
      select: { id: true }
    });

    if (!referrer || referrer.id === studentId) {
      throw new BadRequestException("Referral code is not valid.");
    }

    if (existingReferral) {
      throw new BadRequestException("A different referral is already linked to this student.");
    }

    return {
      discountInPaise: BENZO.referralDiscountInPaise,
      referral: {
        referrerId: referrer.id,
        createIfMissing: true
      }
    };
  }

  private async getAvailableWalletBalance(userId: string) {
    const result = await this.prisma.walletTransaction.aggregate({
      where: {
        userId,
        OR: [{ status: "SETTLED" }, { status: "PENDING", amountInPaise: { lt: 0 } }]
      },
      _sum: {
        amountInPaise: true
      }
    });

    return result._sum.amountInPaise ?? 0;
  }
}
