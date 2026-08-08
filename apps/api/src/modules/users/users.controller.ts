import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { UsersService } from "./users.service";

@Controller({ path: "users", version: "1" })
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  listUsers() {
    return this.usersService.listUsers();
  }
}

