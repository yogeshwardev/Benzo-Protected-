import { IsIn, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateRecordingDto {
  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  liveClassId?: string;

  @IsString()
  @Length(2, 80)
  providerVideoId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsIn(["PENDING", "PROCESSING", "READY", "FAILED"])
  status?: "PENDING" | "PROCESSING" | "READY" | "FAILED";
}

