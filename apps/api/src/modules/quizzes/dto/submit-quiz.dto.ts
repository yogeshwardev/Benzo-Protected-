import { IsInt, IsObject, Min } from "class-validator";

export class SubmitQuizDto {
  @IsObject()
  answers!: Record<string, number>;

  @IsInt()
  @Min(0)
  durationSeconds!: number;
}

