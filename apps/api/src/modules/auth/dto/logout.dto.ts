import { IsString, Length } from "class-validator";

export class LogoutDto {
  @IsString()
  @Length(20, 300)
  refreshToken!: string;
}

