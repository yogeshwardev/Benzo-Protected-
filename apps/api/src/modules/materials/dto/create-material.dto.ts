import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateMaterialDto {
  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsString()
  @Length(3, 500)
  r2Key!: string;

  @IsString()
  @Length(3, 120)
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsOptional()
  @IsBoolean()
  private?: boolean;
}

