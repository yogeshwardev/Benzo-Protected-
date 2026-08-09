import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateLiveClassDto } from "./dto/create-live-class.dto";
import { UpdateLiveClassStatusDto } from "./dto/update-live-class-status.dto";
import { LiveClassesService } from "./live-classes.service";

@Controller({ path: "live-classes", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listCourseClasses(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.liveClassesService.listCourseClasses(user, courseId);
  }

  @Get("me/upcoming")
  @Roles("STUDENT", "INSTRUCTOR")
  listMyUpcoming(@CurrentUserDecorator() user: CurrentUser) {
    return this.liveClassesService.listMyUpcoming(user);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createLiveClass(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateLiveClassDto) {
    return this.liveClassesService.createLiveClass(user, dto);
  }

  @Patch(":id/status")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  updateStatus(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("id") id: string,
    @Body() dto: UpdateLiveClassStatusDto
  ) {
    return this.liveClassesService.updateStatus(user, id, dto);
  }

  @Post(":id/token")
  @Roles("INSTRUCTOR", "STUDENT")
  issueJoinToken(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string) {
    return this.liveClassesService.issueJoinToken(user, id);
  }
}

