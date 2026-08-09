import { Controller, Get, Header, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { FinancialQueryDto } from "./dto/financial-query.dto";
import { FinancialService } from "./financial.service";

@Controller({ path: "financial", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN")
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get("summary")
  getSummary(@Query() query: FinancialQueryDto) {
    return this.financialService.getSummary(query);
  }

  @Get("payments")
  listPayments(@Query() query: FinancialQueryDto) {
    return this.financialService.listPayments(query);
  }

  @Get("exports/payments.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="benzo-payments.csv"')
  exportPaymentsCsv(@Query() query: FinancialQueryDto) {
    return this.financialService.exportPaymentsCsv(query);
  }
}

