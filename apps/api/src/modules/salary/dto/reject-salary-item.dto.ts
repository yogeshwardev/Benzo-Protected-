import { IsString, Length } from "class-validator";

export class RejectSalaryItemDto {
  @IsString()
  @Length(3, 240)
  reason!: string;
}

