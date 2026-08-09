import { IsBoolean } from "class-validator";

export class UpdateEnrollmentAccessDto {
  @IsBoolean()
  active!: boolean;
}
