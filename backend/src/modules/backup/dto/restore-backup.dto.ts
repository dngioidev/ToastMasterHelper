import { IsObject, IsString } from 'class-validator';

export class RestoreBackupDto {
  @IsString()
  version!: string;

  @IsString()
  exported_at!: string;

  @IsObject()
  data!: Record<string, unknown>;
}
