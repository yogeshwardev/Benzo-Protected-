import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CurrentUser } from "../../common/rbac/current-user";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateUserStatusDto } from "./dto/update-user-status.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
  }

  listAuditLogs() {
    return this.prisma.auditLog.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } }
      }
    });
  }

  async updateStatus(actor: CurrentUser, id: string, dto: UpdateUserStatusDto) {
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    if (!target) {
      throw new NotFoundException("User not found.");
    }

    if (target.id === actor.id) {
      throw new ForbiddenException("You cannot change your own account status.");
    }

    if (target.role === "SUPER_ADMIN" || (actor.role === "ADMIN" && target.role === "ADMIN")) {
      throw new ForbiddenException("Only the super admin can manage admin accounts.");
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: dto.status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
        entity: "User",
        entityId: id,
        metadata: { previousStatus: target.status, role: target.role }
      }
    });

    return updated;
  }
}
