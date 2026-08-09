import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateInstructorDto } from "./dto/create-instructor.dto";
import { InstructorsService } from "./instructors.service";

@Controller({ path: "instructors", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get("me")
  @Roles("INSTRUCTOR")
  getMyProfile(@CurrentUserDecorator() user: CurrentUser) {
    return this.instructorsService.getMyProfile(user.id);
  }

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  listInstructors() {
    return this.instructorsService.listInstructors();
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN")
  createInstructor(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.createInstructor(dto);
  }
}
