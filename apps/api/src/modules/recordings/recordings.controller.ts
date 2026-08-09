import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/rbac/current-user.decorator";
import type { CurrentUser } from "../../common/rbac/current-user";
import { JwtAuthGuard } from "../../common/rbac/jwt-auth.guard";
import { Roles } from "../../common/rbac/roles.decorator";
import { RolesGuard } from "../../common/rbac/roles.guard";
import { CreateRecordingDto } from "./dto/create-recording.dto";
import { RecordingsService } from "./recordings.service";

@Controller({ path: "recordings", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Get("course/:courseId")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  listCourseRecordings(@CurrentUserDecorator() user: CurrentUser, @Param("courseId") courseId: string) {
    return this.recordingsService.listCourseRecordings(user, courseId);
  }

  @Get(":id/playback")
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT")
  getPlaybackMetadata(@CurrentUserDecorator() user: CurrentUser, @Param("id") id: string) {
    return this.recordingsService.getPlaybackMetadata(user, id);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "INSTRUCTOR")
  createRecording(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateRecordingDto) {
    return this.recordingsService.createRecording(user, dto);
  }
}

