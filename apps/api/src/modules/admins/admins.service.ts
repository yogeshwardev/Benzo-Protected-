import { ConflictException, Injectable } from "@nestjs/common";
import { AccountStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAdminDto } from "./dto/create-admin.dto";

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  listAdmins() {
    return this.prisma.adminProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, status: true, createdAt: true }
        }
      }
    });
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existing) {
      throw new ConflictException("An account already exists for this email.");
    }

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        mobile: dto.mobile,
        name: dto.name,
        role: "ADMIN",
        status: AccountStatus.PENDING_ACTIVATION,
        adminProfile: { create: {} }
      },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
  }
}

