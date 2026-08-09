import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { InvoicesService } from "./invoices.service";

@Controller({ path: "invoices", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(":invoiceNo")
  @Roles("SUPER_ADMIN", "ADMIN", "STUDENT")
  getInvoice(@CurrentUserDecorator() user: CurrentUser, @Param("invoiceNo") invoiceNo: string) {
    return this.invoicesService.getInvoice(user, invoiceNo);
  }
}

