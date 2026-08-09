import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { AttendanceService } from "./attendance.service";

@Controller({ path: "attendance", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("me")
  @Roles("INSTRUCTOR", "STUDENT")
  listMine(@CurrentUserDecorator() user: CurrentUser) {
    return this.attendanceService.listMyAttendance(user);
  }

  @Post("live-classes/:liveClassId/join")
  @Roles("INSTRUCTOR", "STUDENT")
  join(@CurrentUserDecorator() user: CurrentUser, @Param("liveClassId") liveClassId: string) {
    return this.attendanceService.recordJoin(user, liveClassId);
  }

  @Post("live-classes/:liveClassId/leave")
  @Roles("INSTRUCTOR", "STUDENT")
  leave(@CurrentUserDecorator() user: CurrentUser, @Param("liveClassId") liveClassId: string) {
    return this.attendanceService.recordLeave(user, liveClassId);
  }

  @Post("live-classes/:liveClassId/summarize")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  summarize(@CurrentUserDecorator() user: CurrentUser, @Param("liveClassId") liveClassId: string) {
    return this.attendanceService.summarizeLiveClass(user, liveClassId);
  }

  @Get("live-classes/:liveClassId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  listClassAttendance(@CurrentUserDecorator() user: CurrentUser, @Param("liveClassId") liveClassId: string) {
    return this.attendanceService.listClassAttendance(user, liveClassId);
  }
}
