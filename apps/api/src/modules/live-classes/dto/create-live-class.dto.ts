import { IsDateString, IsOptional, IsString, Length } from "class-validator";

export class CreateLiveClassDto {
  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}

