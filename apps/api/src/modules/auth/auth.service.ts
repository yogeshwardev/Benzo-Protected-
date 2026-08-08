import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { customAlphabet } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterStudentDto } from "./dto/register-student.dto";

const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existingUser) {
      throw new ConflictException("An account already exists for this email.");
    }

    const referrer = dto.referralCode
      ? await this.prisma.studentProfile.findUnique({ where: { referralCode: dto.referralCode } })
      : null;

    const user = await this.prisma.user.create({
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
            referredById: referrer?.id
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

    if (referrer) {
      await this.prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: user.studentProfile!.id
        }
      });
    }

    return { user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException("Account is suspended.");
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    };
  }
}
