import { ConflictException, Injectable } from "@nestjs/common";
import { AccountStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAdminDto } from "./dto/create-admin.dto";

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        mobile: dto.mobile,
        name: dto.name,
        role: "ADMIN",
        status: dto.temporaryPassword ? AccountStatus.ACTIVE : AccountStatus.PENDING_ACTIVATION,
        passwordHash: dto.temporaryPassword ? await argon2.hash(dto.temporaryPassword) : undefined,
        adminProfile: { create: {} }
      },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    return {
      user,
      activation: dto.temporaryPassword ? undefined : await this.authService.createPasswordSetupToken(user.id)
    };
  }
}
