import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { ApproveSalaryItemDto } from "./dto/approve-salary-item.dto";
import { CreateSalaryPayoutDto } from "./dto/create-salary-payout.dto";
import { RejectSalaryItemDto } from "./dto/reject-salary-item.dto";
import { SalaryService } from "./salary.service";

@Controller({ path: "salary", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get("me/items")
  @Roles("INSTRUCTOR")
  listMyItems(@CurrentUserDecorator() user: CurrentUser) {
    return this.salaryService.listInstructorItems(user.id);
  }

  @Get("me/payouts")
  @Roles("INSTRUCTOR")
  listMyPayouts(@CurrentUserDecorator() user: CurrentUser) {
    return this.salaryService.listInstructorPayouts(user.id);
  }

  @Get("me/attendance")
  @Roles("INSTRUCTOR")
  listMyAttendance(@CurrentUserDecorator() user: CurrentUser) {
    return this.salaryService.listInstructorAttendance(user.id);
  }

  @Get("admin/items")
  @Roles("SUPER_ADMIN", "ADMIN")
  listItemsForAdmin() {
    return this.salaryService.listItemsForAdmin();
  }

  @Get("admin/payouts")
  @Roles("SUPER_ADMIN", "ADMIN")
  listPayoutsForAdmin() {
    return this.salaryService.listPayoutsForAdmin();
  }

  @Get("admin/attendance")
  @Roles("SUPER_ADMIN", "ADMIN")
  listInstructorAttendanceForAdmin() {
    return this.salaryService.listInstructorAttendanceForAdmin();
  }

  @Post("live-classes/:liveClassId/generate")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  generateSalaryItem(@CurrentUserDecorator() user: CurrentUser, @Param("liveClassId") liveClassId: string) {
    return this.salaryService.generateSalaryItem(user, liveClassId);
  }

  @Patch("items/:id/approve")
  @Roles("SUPER_ADMIN", "ADMIN")
  approveItem(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string, @Body() dto: ApproveSalaryItemDto) {
    return this.salaryService.approveItem(user.id, id, dto);
  }

  @Patch("items/:id/reject")
  @Roles("SUPER_ADMIN", "ADMIN")
  rejectItem(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string, @Body() dto: RejectSalaryItemDto) {
    return this.salaryService.rejectItem(user.id, id, dto);
  }

  @Post("payouts")
  @Roles("SUPER_ADMIN", "ADMIN")
  createPayout(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateSalaryPayoutDto) {
    return this.salaryService.createPayout(user.id, dto);
  }
}

