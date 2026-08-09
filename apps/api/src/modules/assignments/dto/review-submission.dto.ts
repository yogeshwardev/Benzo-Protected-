import { IsIn, IsOptional, IsString, Length } from "class-validator";

export class ReviewSubmissionDto {
  @IsIn(["APPROVED", "REJECTED", "RESUBMISSION_REQUIRED"])
  status!: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";

  @IsOptional()
  @IsString()
  @Length(2, 2000)
  feedback?: string;
}

