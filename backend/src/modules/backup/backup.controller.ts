import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BackupService } from './backup.service';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /** Download a full JSON backup of all system data */
  @Get('download')
  async download(@Res() res: Response): Promise<void> {
    const payload = await this.backupService.generateBackup();
    const json = JSON.stringify(payload, null, 2);
    const date = new Date().toISOString().split('T')[0];
    const filename = `tm-backup-${date}.json`;

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': Buffer.byteLength(json, 'utf8'),
    });
    res.end(json);
  }

  /** Restore system from a previously downloaded backup */
  @Post('restore')
  @HttpCode(200)
  async restore(
    @Body() dto: RestoreBackupDto,
  ): Promise<{ restored: number }> {
    return this.backupService.restoreBackup(dto as Parameters<BackupService['restoreBackup']>[0]);
  }
}
