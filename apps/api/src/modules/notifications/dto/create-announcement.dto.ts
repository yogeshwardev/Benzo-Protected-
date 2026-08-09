import { AnnouncementAudience } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateAnnouncementDto {
  @IsEnum(AnnouncementAudience)
  audience!: AnnouncementAudience;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsString()
  @Length(3, 180)
  title!: string;

  @IsString()
  @Length(10, 5000)
  body!: string;
}
