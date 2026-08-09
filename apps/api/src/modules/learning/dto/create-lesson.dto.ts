import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateLessonDto {
  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsInt()
  @Min(1)
  position!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  freePreview?: boolean;
}

