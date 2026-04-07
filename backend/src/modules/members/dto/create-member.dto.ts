import {
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
}
