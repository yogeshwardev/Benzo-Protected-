import { IsDateString, IsOptional, IsString, Length } from "class-validator";

export class CreateAssignmentDto {
  @IsString()
  courseId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsString()
  @Length(10, 5000)
  description!: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

