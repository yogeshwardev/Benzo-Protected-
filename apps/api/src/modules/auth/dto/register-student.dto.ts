import { IsEmail, IsOptional, IsString, Length, MinLength } from "class-validator";

export class RegisterStudentDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  mobile?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

