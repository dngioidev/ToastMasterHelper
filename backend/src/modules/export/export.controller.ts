import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ExportSessionsDto } from './dto/export-sessions.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /** Export online + offline sessions within a date range */
  @Get('sessions')
  async exportSessions(
    @Query() dto: ExportSessionsDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportService.exportSessions(dto.from, dto.to);
    const filename = `tm-sessions-${dto.from}-to-${dto.to}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });
    res.end(buffer);
  }

  /** Export full system: members + all sessions + analytics */
  @Get('full')
  async exportFull(@Res() res: Response): Promise<void> {
    const buffer = await this.exportService.exportFull();
    const date = new Date().toISOString().split('T')[0];
    const filename = `tm-full-export-${date}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });
    res.end(buffer);
  }
}
