import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OfflineRole } from '../offline-session-assignment.entity';

export class AssignmentDto {
  @IsUUID()
  @IsOptional()
  member_id?: string;

  @IsEnum(OfflineRole)
  role!: OfflineRole;

  @IsInt()
  @Min(0)
  @IsOptional()
  slot_index?: number;

  @IsBoolean()
  @IsOptional()
  passed?: boolean;
}

export class CreateOfflineSessionDto {
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  num_speakers?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  num_backup_speakers?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_cancelled?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentDto)
  @IsOptional()
  assignments?: AssignmentDto[];
}
