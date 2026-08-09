import { IsString, Length } from "class-validator";

export class MarkWithdrawalPaidDto {
  @IsString()
  @Length(3, 120)
  adminReference!: string;
}

