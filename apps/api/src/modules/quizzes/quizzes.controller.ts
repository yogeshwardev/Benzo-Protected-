import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { SubmitQuizDto } from "./dto/submit-quiz.dto";
import { QuizzesService } from "./quizzes.service";

@Controller({ path: "quizzes", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listCourseQuizzes(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.quizzesService.listCourseQuizzes(user, courseId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createQuiz(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(user, dto);
  }

  @Post(":quizId/attempts")
  @Roles("STUDENT")
  submitQuiz(@CurrentUserDecorator() user: CurrentUser, @Param("quizId") quizId: string, @Body() dto: SubmitQuizDto) {
    return this.quizzesService.submitQuiz(user, quizId, dto);
  }

  @Get(":quizId/attempts")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  listAttempts(@CurrentUserDecorator() user: CurrentUser, @Param("quizId") quizId: string) {
    return this.quizzesService.listAttempts(user, quizId);
  }
}

