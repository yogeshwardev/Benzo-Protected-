import { IsInt, IsString, Length, Min } from "class-validator";

export class CreateWithdrawalDto {
  @IsInt()
  @Min(1)
  amountInPaise!: number;

  @IsString()
  @Length(4, 80)
  bankMasked!: string;
}

