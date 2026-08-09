import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { ReferralsService } from "./referrals.service";

@Controller({ path: "referrals", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get("me")
  @Roles("STUDENT")
  getMyReferrals(@CurrentUserDecorator() user: CurrentUser) {
    return this.referralsService.getStudentReferrals(user.id);
  }

  @Get("admin/all")
  @Roles("SUPER_ADMIN", "ADMIN")
  listReferralsForAdmin() {
    return this.referralsService.listReferralsForAdmin();
  }
}

