import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { UsersService } from "./users.service";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

@Controller({ path: "users", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  listUsers() {
    return this.usersService.listUsers();
  }

  @Get("audit-logs")
  @Roles("SUPER_ADMIN", "ADMIN")
  listAuditLogs() {
    return this.usersService.listAuditLogs();
  }

  @Patch(":id/status")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateStatus(
    @CurrentUserDecorator() actor: CurrentUser,
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    return this.usersService.updateStatus(actor, id, dto);
  }
}
