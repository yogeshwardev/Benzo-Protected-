import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AccountStatus } from "@prisma/client";
import { PrismaService } from "../../modules/prisma/prisma.service";
import type { CurrentUser } from "./current-user";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: CurrentUser["role"];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined>; user?: CurrentUser }>();
    const authorization = request.headers.authorization;
    const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
    const token = headerValue?.startsWith("Bearer ") ? headerValue.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException("Missing access token.");
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.get<string>("JWT_SECRET", "development-only-change-me")
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired access token.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user || user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException("Account is not active.");
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return true;
  }
}

