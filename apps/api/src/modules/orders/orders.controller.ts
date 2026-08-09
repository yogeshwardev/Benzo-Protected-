import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller({ path: "orders", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles("STUDENT")
  createOrder(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createCourseOrder(user.id, dto);
  }

  @Post(":id/cancel")
  @Roles("STUDENT")
  cancelOrder(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string) {
    return this.ordersService.cancelCourseOrder(user.id, id);
  }

  @Get("me")
  @Roles("STUDENT")
  listMyOrders(@CurrentUserDecorator() user: CurrentUser) {
    return this.ordersService.listStudentOrders(user.id);
  }

  @Get("admin/all")
  @Roles("SUPER_ADMIN", "ADMIN")
  listOrdersForAdmin() {
    return this.ordersService.listOrdersForAdmin();
  }
}
