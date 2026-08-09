import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateWithdrawalDto } from "./dto/create-withdrawal.dto";
import { MarkWithdrawalPaidDto } from "./dto/mark-withdrawal-paid.dto";
import { RejectWithdrawalDto } from "./dto/reject-withdrawal.dto";
import { WithdrawalsService } from "./withdrawals.service";

@Controller({ path: "withdrawals", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @Roles("STUDENT")
  createWithdrawal(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateWithdrawalDto) {
    return this.withdrawalsService.createWithdrawal(user.id, dto);
  }

  @Get("me")
  @Roles("STUDENT")
  listMyWithdrawals(@CurrentUserDecorator() user: CurrentUser) {
    return this.withdrawalsService.listStudentWithdrawals(user.id);
  }

  @Get("admin/all")
  @Roles("SUPER_ADMIN", "ADMIN")
  listWithdrawalsForAdmin() {
    return this.withdrawalsService.listWithdrawalsForAdmin();
  }

  @Patch(":id/paid")
  @Roles("SUPER_ADMIN", "ADMIN")
  markPaid(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string, @Body() dto: MarkWithdrawalPaidDto) {
    return this.withdrawalsService.markPaid(user.id, id, dto);
  }

  @Patch(":id/reject")
  @Roles("SUPER_ADMIN", "ADMIN")
  reject(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string, @Body() dto: RejectWithdrawalDto) {
    return this.withdrawalsService.reject(user.id, id, dto);
  }
}

