import { IsString, Length } from "class-validator";

export class EmailVerificationDto {
  @IsString()
  @Length(20, 200)
  token!: string;
}

