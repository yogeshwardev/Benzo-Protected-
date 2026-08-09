import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  discountInPaise?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDiscountInPaise?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

