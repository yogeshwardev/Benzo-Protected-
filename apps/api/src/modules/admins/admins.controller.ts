import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { AdminsService } from "./admins.service";
import { CreateAdminDto } from "./dto/create-admin.dto";

@Controller({ path: "admins", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Roles("SUPER_ADMIN")
  listAdmins() {
    return this.adminsService.listAdmins();
  }

  @Post()
  @Roles("SUPER_ADMIN")
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminsService.createAdmin(dto);
  }
}
