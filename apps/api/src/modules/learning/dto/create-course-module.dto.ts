import { IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateCourseModuleDto {
  @IsString()
  courseId!: string;

  @IsString()
  @Length(2, 160)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  description?: string;

  @IsInt()
  @Min(1)
  position!: number;
}

