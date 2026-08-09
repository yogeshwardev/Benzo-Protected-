import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { NotificationsService } from "./notifications.service";

@Controller({ path: "notifications", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("me")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listMine(@CurrentUserDecorator() user: CurrentUser) {
    return this.notificationsService.listMyNotifications(user.id);
  }

  @Patch(":notificationId/read")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  markRead(@CurrentUserDecorator() user: CurrentUser, @Param("notificationId") notificationId: string) {
    return this.notificationsService.markRead(user.id, notificationId);
  }

  @Patch("me/read-all")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  markAllRead(@CurrentUserDecorator() user: CurrentUser) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Get("announcements")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listAnnouncements(@CurrentUserDecorator() user: CurrentUser) {
    return this.notificationsService.listAnnouncements(user);
  }

  @Post("announcements")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createAnnouncement(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateAnnouncementDto) {
    return this.notificationsService.createAnnouncement(user, dto);
  }
}
