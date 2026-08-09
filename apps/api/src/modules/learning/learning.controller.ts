import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateCourseModuleDto } from "./dto/create-course-module.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonProgressDto } from "./dto/update-lesson-progress.dto";
import { LearningService } from "./learning.service";

@Controller({ path: "learning", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get("courses/:courseId/outline")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  getCourseOutline(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.learningService.getCourseOutline(user, courseId);
  }

  @Get("courses/:courseId/progress")
  @Roles("STUDENT")
  getCourseProgress(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.learningService.getCourseProgress(user, courseId);
  }

  @Post("modules")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createModule(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateCourseModuleDto) {
    return this.learningService.createModule(user, dto);
  }

  @Post("lessons")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createLesson(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateLessonDto) {
    return this.learningService.createLesson(user, dto);
  }

  @Patch("lessons/:lessonId/progress")
  @Roles("STUDENT")
  updateLessonProgress(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("lessonId") lessonId: string,
    @Body() dto: UpdateLessonProgressDto
  ) {
    return this.learningService.updateLessonProgress(user, lessonId, dto);
  }
}

