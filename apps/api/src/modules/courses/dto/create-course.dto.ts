import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

class CreateCourseScheduleDto {
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek!: number;

  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute!: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute!: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateCourseDto {
  @IsString()
  @Length(2, 120)
  title!: string;

  @IsString()
  @Length(2, 160)
  slug!: string;

  @IsString()
  @Length(10, 240)
  shortDescription!: string;

  @IsString()
  @Length(20, 5000)
  fullDescription!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsString()
  category!: string;

  @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
  difficulty!: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  @IsInt()
  @Min(1)
  priceInPaise!: number;

  @IsArray()
  @IsString({ each: true })
  requirements!: string[];

  @IsArray()
  @IsString({ each: true })
  outcomes!: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCourseScheduleDto)
  schedule?: CreateCourseScheduleDto;
}

