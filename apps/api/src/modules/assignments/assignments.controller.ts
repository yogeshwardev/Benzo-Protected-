import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { ReviewSubmissionDto } from "./dto/review-submission.dto";
import { SubmitAssignmentDto } from "./dto/submit-assignment.dto";

@Controller({ path: "assignments", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listCourseAssignments(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.assignmentsService.listCourseAssignments(user, courseId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createAssignment(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(user, dto);
  }

  @Post(":assignmentId/submissions")
  @Roles("STUDENT")
  submitAssignment(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("assignmentId") assignmentId: string,
    @Body() dto: SubmitAssignmentDto
  ) {
    return this.assignmentsService.submitAssignment(user, assignmentId, dto);
  }

  @Get(":assignmentId/submissions")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  listSubmissions(@CurrentUserDecorator() user: CurrentUser, @Param("assignmentId") assignmentId: string) {
    return this.assignmentsService.listSubmissions(user, assignmentId);
  }

  @Patch("submissions/:submissionId/review")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  reviewSubmission(
    @CurrentUserDecorator() user: CurrentUser,
    @Param("submissionId") submissionId: string,
    @Body() dto: ReviewSubmissionDto
  ) {
    return this.assignmentsService.reviewSubmission(user, submissionId, dto);
  }
}

