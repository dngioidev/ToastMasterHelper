import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOnlineSessionDto {
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsUUID()
  @IsOptional()
  main_chairman_id?: string;

  @IsUUID()
  @IsOptional()
  sub_chairman_id?: string;

  @IsUUID()
  @IsOptional()
  speaker1_id?: string;

  @IsUUID()
  @IsOptional()
  speaker2_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_cancelled?: boolean;
}
