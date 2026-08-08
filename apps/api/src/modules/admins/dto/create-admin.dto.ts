import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class CreateAdminDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  mobile?: string;
}

