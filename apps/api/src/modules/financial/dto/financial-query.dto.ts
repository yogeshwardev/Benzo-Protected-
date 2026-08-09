import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class FinancialQueryDto {
  @IsOptional()
  @IsIn(["today", "yesterday", "last7", "last30", "thisMonth"])
  preset?: "today" | "yesterday" | "last7" | "last30" | "thisMonth";

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsIn(["CREATED", "PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"])
  status?: "CREATED" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
}

