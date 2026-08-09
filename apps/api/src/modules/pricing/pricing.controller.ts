import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CheckoutQuoteDto } from "./dto/checkout-quote.dto";
import { PricingService } from "./pricing.service";

@Controller({ path: "pricing", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post("checkout-quote")
  @Roles("STUDENT")
  checkoutQuote(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CheckoutQuoteDto) {
    return this.pricingService.quoteForStudent(user.id, dto);
  }
}

