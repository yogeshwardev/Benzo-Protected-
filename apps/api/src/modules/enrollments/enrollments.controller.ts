import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { EnrollmentsService } from "./enrollments.service";

@Controller({ path: "enrollments", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get("me")
  @Roles("STUDENT")
  listMyEnrollments(@CurrentUserDecorator() user: CurrentUser) {
    return this.enrollmentsService.listStudentEnrollments(user.id);
  }

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  listCourseEnrollments(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.enrollmentsService.listCourseEnrollments(user, courseId);
  }
}

