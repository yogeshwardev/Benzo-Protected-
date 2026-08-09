import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateRecordingStatusDto {
  @IsIn(["PENDING", "PROCESSING", "READY", "FAILED"])
  status!: "PENDING" | "PROCESSING" | "READY" | "FAILED";

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

