import { IsInt, IsOptional, Min } from "class-validator";

export class ApproveSalaryItemDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  amountInPaise?: number;
}

