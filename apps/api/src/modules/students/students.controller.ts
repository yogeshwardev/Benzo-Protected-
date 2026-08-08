import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { StudentsService } from "./students.service";

@Controller({ path: "students", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  listStudents() {
    return this.studentsService.listStudents();
  }
}
