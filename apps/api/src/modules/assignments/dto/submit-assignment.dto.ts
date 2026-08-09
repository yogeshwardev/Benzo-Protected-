import { IsString, Length } from "class-validator";

export class SubmitAssignmentDto {
  @IsString()
  @Length(5, 1000)
  submissionUrl!: string;
}

