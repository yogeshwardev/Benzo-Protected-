import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateInstructorDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 20)
  mobile!: string;

  @IsString()
  @Length(2, 180)
  qualification!: string;

  @IsString()
  courseId!: string;

  @IsInt()
  @Min(1)
  perClassSalaryInPaise!: number;

  @IsDateString()
  joiningDate!: string;

  @IsOptional()
  @IsString()
  bankMasked?: string;
}

