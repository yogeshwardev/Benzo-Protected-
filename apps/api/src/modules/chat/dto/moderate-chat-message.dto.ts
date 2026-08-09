import { IsString, Length } from "class-validator";

export class ModerateChatMessageDto {
  @IsString()
  @Length(3, 240)
  reason!: string;
}
