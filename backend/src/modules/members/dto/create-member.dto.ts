import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MemberStatus } from '../member.entity';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  project_level?: number;

  @IsBoolean()
  @IsOptional()
  online_as_chairman?: boolean;

  @IsBoolean()
  @IsOptional()
  online_as_speaker?: boolean;

  @IsBoolean()
  @IsOptional()
  attends_offline?: boolean;
}
