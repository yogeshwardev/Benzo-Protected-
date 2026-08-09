import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateCouponDto } from "./dto/create-coupon.dto";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  listCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { redemptions: true, orders: true }
        }
      }
    });
  }

  createCoupon(dto: CreateCouponDto) {
    if (!dto.discountInPaise && !dto.discountPercent) {
      throw new BadRequestException("Coupon must include a fixed or percentage discount.");
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        discountInPaise: dto.discountInPaise,
        discountPercent: dto.discountPercent,
        maxDiscountInPaise: dto.maxDiscountInPaise,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        active: dto.active ?? true
      }
    });
  }
}

