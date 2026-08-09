import { IsString, Length } from "class-validator";

export class RejectWithdrawalDto {
  @IsString()
  @Length(3, 240)
  reason!: string;
}

