import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { WalletService } from "./wallet.service";

@Controller({ path: "wallet", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get("me")
  @Roles("STUDENT")
  getMyWallet(@CurrentUserDecorator() user: CurrentUser) {
    return this.walletService.getWalletForUser(user.id);
  }

  @Get("admin/transactions")
  @Roles("SUPER_ADMIN", "ADMIN")
  listWalletTransactions() {
    return this.walletService.listRecentTransactions();
  }
}

