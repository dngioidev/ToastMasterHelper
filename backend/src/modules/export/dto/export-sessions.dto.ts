import { IsDateString } from 'class-validator';

export class ExportSessionsDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
