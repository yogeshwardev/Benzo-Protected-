import { IsIn } from "class-validator";

export class UpdateLiveClassStatusDto {
  @IsIn(["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"])
  status!: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
}

