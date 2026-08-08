import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";

@Controller({ path: "courses", version: "1" })
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  listPublishedCourses() {
    return this.coursesService.listPublishedCourses();
  }

  @Get(":slug")
  getCourseBySlug(@Param("slug") slug: string) {
    return this.coursesService.getCourseBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN")
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }
}

