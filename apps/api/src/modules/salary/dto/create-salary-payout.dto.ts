import { ArrayMinSize, IsArray, IsString, Length } from "class-validator";

export class CreateSalaryPayoutDto {
  @IsString()
  instructorId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  salaryItemIds!: string[];

  @IsString()
  @Length(3, 120)
  paymentReference!: string;
}

