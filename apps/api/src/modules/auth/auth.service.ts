import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AccountStatus, Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash } from "crypto";
import { customAlphabet } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterStudentDto } from "./dto/register-student.dto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";

const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
const tokenAlphabet = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  64
);
const refreshTokenDays = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (existingUser) {
      throw new ConflictException("An account already exists for this email.");
    }

    const referrer = dto.referralCode
      ? await this.prisma.studentProfile.findUnique({
          where: { referralCode: dto.referralCode.trim().toUpperCase() }
        })
      : null;

    if (dto.referralCode && !referrer) {
      throw new BadRequestException("Referral code is not valid.");
    }

    const user = await this.createStudentUser(dto, referrer?.id);
    const verification = await this.createEmailVerificationToken(user.id);

    return { user, verification };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException("Account is suspended.");
    }

    const tokens = await this.createSession(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true
          }
        }
      }
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.user.status === AccountStatus.SUSPENDED
    ) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });

      const tokens = await this.createSession(storedToken.user, tx);

      return {
        ...tokens,
        user: storedToken.user
      };
    });
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    return { success: true };
  }

  async requestEmailVerification(userId: string) {
    return this.createEmailVerificationToken(userId);
  }

  async verifyEmail(token: string) {
    const storedToken = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
      include: { user: true }
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
      throw new BadRequestException("Verification token is invalid or expired.");
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() }
      });

      return tx.user.update({
        where: { id: storedToken.userId },
        data: {
          emailVerifiedAt: new Date(),
          status:
            storedToken.user.status === AccountStatus.PENDING_ACTIVATION
              ? AccountStatus.ACTIVE
              : storedToken.user.status
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerifiedAt: true
        }
      });
    });

    return { user };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const response: { success: true; reset?: { devToken?: string; expiresAt: Date } } = { success: true };

    if (!user) {
      return response;
    }

    const reset = await this.createPasswordSetupToken(user.id);

    if (this.isDevelopment()) {
      response.reset = reset;
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const storedToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(dto.token) }
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
      throw new BadRequestException("Reset token is invalid or expired.");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() }
      });
      await tx.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      await tx.user.update({
        where: { id: storedToken.userId },
        data: {
          passwordHash: await argon2.hash(dto.password),
          status: AccountStatus.ACTIVE
        }
      });
    });

    return { success: true };
  }

  async createPasswordSetupToken(userId: string) {
    const token = tokenAlphabet();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt
      }
    });

    return {
      devToken: this.isDevelopment() ? token : undefined,
      expiresAt
    };
  }

  private async createStudentUser(dto: RegisterStudentDto, referrerId: string | undefined) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: dto.email.toLowerCase(),
            mobile: dto.mobile,
            name: dto.name,
            passwordHash: await argon2.hash(dto.password),
            role: "STUDENT",
            status: AccountStatus.PENDING_ACTIVATION,
            studentProfile: {
              create: {
                studentCode: `BZ-STU-${codeAlphabet()}`,
                referralCode: `BENZO-${codeAlphabet()}`,
                referredById: referrerId
              }
            }
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            studentProfile: {
              select: {
                id: true,
                studentCode: true,
                referralCode: true
              }
            }
          }
        });

        if (referrerId) {
          await tx.referral.create({
            data: {
              referrerId,
              referredId: createdUser.studentProfile!.id
            }
          });
        }

        return createdUser;
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error, "mobile")) {
        throw new ConflictException("An account already exists for this mobile number.");
      }

      if (this.isUniqueConstraintError(error, "email")) {
        throw new ConflictException("An account already exists for this email.");
      }

      throw error;
    }
  }

  private async createEmailVerificationToken(userId: string) {
    const token = tokenAlphabet();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt
      }
    });

    return {
      devToken: this.isDevelopment() ? token : undefined,
      expiresAt
    };
  }

  private async createSession(
    user: { id: string; email: string; role: string },
    tx: Pick<PrismaService, "refreshToken"> = this.prisma
  ) {
    const refreshToken = tokenAlphabet();
    const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt
      }
    });

    return {
      accessToken: await this.jwt.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role
        },
        {
          secret: this.config.get<string>("JWT_SECRET", "development-only-change-me"),
          expiresIn: "15m"
        }
      ),
      refreshToken,
      refreshTokenExpiresAt: expiresAt
    };
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private isDevelopment() {
    return this.config.get<string>("NODE_ENV", "development") !== "production";
  }

  private isUniqueConstraintError(error: unknown, field: string) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes(field)
    );
  }
}
