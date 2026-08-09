import { IsString, Length } from "class-validator";

export class RevokeCertificateDto {
  @IsString()
  @Length(3, 240)
  reason!: string;
}
