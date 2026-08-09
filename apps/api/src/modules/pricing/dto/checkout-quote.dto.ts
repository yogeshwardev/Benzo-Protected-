import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CheckoutQuoteDto {
  @IsString()
  courseId!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  walletAmountInPaise?: number;
}

