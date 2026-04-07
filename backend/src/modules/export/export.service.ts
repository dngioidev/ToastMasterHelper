import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { OfflineRole } from '../offline-sessions/offline-session-assignment.entity';
import { Member, MemberStatus } from '../members/member.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(OnlineSession)
    private readonly onlineRepo: Repository<OnlineSession>,
    @InjectRepository(OfflineSession)
    private readonly offlineRepo: Repository<OfflineSession>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async exportSessions(from: string, to: string): Promise<Buffer> {
    const [online, offline] = await Promise.all([
      this.onlineRepo.find({
        where: { date: Between(from, to) },
        order: { date: 'ASC' },
      }),
      this.offlineRepo.find({
        where: { date: Between(from, to) },
        order: { date: 'ASC' },
      }),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'TM Scheduler';
    wb.created = new Date();

    this.buildOnlineSheet(wb, online);
    this.buildOfflineSheet(wb, offline);

    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async exportFull(): Promise<Buffer> {
    const [members, online, offline] = await Promise.all([
      this.memberRepo.find({ order: { name: 'ASC' } }),
      this.onlineRepo.find({ order: { date: 'ASC' } }),
      this.offlineRepo.find({ order: { date: 'ASC' } }),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'TM Scheduler';
    wb.created = new Date();

    this.buildMembersSheet(wb, members);
    this.buildOnlineSheet(wb, online);
    this.buildOfflineSheet(wb, offline);
    this.buildAnalyticsSheet(wb, members);

    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  // ─── Sheet builders ────────────────────────────────────────────────────────

  private buildMembersSheet(wb: ExcelJS.Workbook, members: Member[]): void {
    const ws = wb.addWorksheet('Members');

    ws.columns = [
      { header: 'No.',             key: 'no',               width: 6  },
      { header: 'Name',            key: 'name',             width: 28 },
      { header: 'Status',          key: 'status',           width: 10 },
      { header: 'Project Level',   key: 'project_level',    width: 15 },
      { header: 'Online Chairman', key: 'online_as_chairman', width: 18 },
      { header: 'Online Speaker',  key: 'online_as_speaker',  width: 16 },
      { header: 'Attends Offline', key: 'attends_offline',    width: 16 },
    ];

    const totalCols = 7;

    // Freeze header row + No. / Name columns
    ws.views = [{ state: 'frozen' as const, xSplit: 2, ySplit: 1, topLeftCell: 'C2', activeCell: 'C2' }];

    this.styleHeader(ws, totalCols);

    members.forEach((m, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        name: m.name,
        status: m.status,
        project_level: m.project_level,
        online_as_chairman: m.online_as_chairman ? 'Yes' : 'No',
        online_as_speaker: m.online_as_speaker ? 'Yes' : 'No',
        attends_offline: m.attends_offline ? 'Yes' : 'No',
      });
      row.height = 20;

      // Zebra stripe
      const rowFill: ExcelJS.Fill =
        (idx + 1) % 2 === 0
          ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } }
          : { type: 'pattern', pattern: 'none' };

      // Status badge colours
      const statusFill: ExcelJS.Fill =
        m.status === MemberStatus.ACTIVE
          ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }
          : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        cell.border = this.cellBorder();
        cell.fill   = c === 3 ? statusFill : rowFill;
        cell.alignment =
          c === 1 || c === 3 || c === 4 || c >= 5
            ? { vertical: 'middle', horizontal: 'center' }
            : { vertical: 'middle', horizontal: 'left' };
      }
    });
  }

  private buildOnlineSheet(
    wb: ExcelJS.Workbook,
    sessions: OnlineSession[],
  ): void {
    const ws = wb.addWorksheet('Online Sessions');

    ws.columns = [
      { header: 'No.',           key: 'no',           width: 6  },
      { header: 'Date',          key: 'date',         width: 14 },
      { header: 'Main Chairman', key: 'main_chairman', width: 24 },
      { header: 'Sub Chairman',  key: 'sub_chairman',  width: 24 },
      { header: 'Speaker 1',     key: 'speaker1',      width: 24 },
      { header: 'Speaker 2',     key: 'speaker2',      width: 24 },
      { header: 'Notes',         key: 'notes',         width: 35 },
    ];

    const totalCols = 7;

    // Freeze No. + Date columns and header row
    ws.views = [{ state: 'frozen' as const, xSplit: 2, ySplit: 1, topLeftCell: 'C2', activeCell: 'C2' }];

    this.styleHeader(ws, totalCols);

    sessions.forEach((s, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        date: this.formatDateLabel(s.date),
        main_chairman: s.main_chairman?.name ?? '',
        sub_chairman:  s.sub_chairman?.name  ?? '',
        speaker1:      s.speaker1?.name      ?? '',
        speaker2:      s.speaker2?.name      ?? '',
        notes:         s.notes               ?? '',
      });
      row.height = 20;

      const rowFill: ExcelJS.Fill =
        (idx + 1) % 2 === 0
          ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } }
          : { type: 'pattern', pattern: 'none' };

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        cell.border = this.cellBorder();
        cell.fill   = rowFill;
        cell.alignment =
          c <= 2
            ? { vertical: 'middle', horizontal: 'center' }
            : { vertical: 'middle', horizontal: 'left' };
      }
    });
  }

  private buildOfflineSheet(
    wb: ExcelJS.Workbook,
    sessions: OfflineSession[],
  ): void {
    const ws = wb.addWorksheet('Offline Sessions');

    // ── Role row definitions (rows = roles, columns = sessions) ──────────────
    const ROLE_DEFS: Array<{
      no: number;
      label: string;
      role: OfflineRole;
      slot: number;
      timeline: number;
      bg?: string; // ARGB row fill
    }> = [
      { no: 1,  label: 'Toast Master',  role: OfflineRole.TOAST_MASTER,      slot: 0, timeline: 2 },
      { no: 2,  label: 'Table Tonic',   role: OfflineRole.TABLE_TONIC,       slot: 0, timeline: 8 },
      { no: 3,  label: 'Speaker 1',     role: OfflineRole.SPEAKER,           slot: 0, timeline: 10, bg: 'FFD4EDDA' },
      { no: 4,  label: 'Evaluator 1',   role: OfflineRole.EVALUATOR,         slot: 0, timeline: 3 },
      { no: 5,  label: 'Speaker 2',     role: OfflineRole.SPEAKER,           slot: 1, timeline: 10, bg: 'FFD4EDDA' },
      { no: 6,  label: 'Evaluator 2',   role: OfflineRole.EVALUATOR,         slot: 1, timeline: 3 },
      { no: 7,  label: 'Topic Master',  role: OfflineRole.TOPIC_MASTER,      slot: 0, timeline: 15, bg: 'FFD6EAF8' },
      { no: 8,  label: 'Uh-Ah Counter', role: OfflineRole.UH_AH_COUNTER,    slot: 0, timeline: 1 },
      { no: 9,  label: 'Timer',         role: OfflineRole.TIMER,             slot: 0, timeline: 1 },
      { no: 10, label: 'GE',            role: OfflineRole.GENERAL_EVALUATOR, slot: 0, timeline: 5 },
    ];

    // ── Column definitions: No. | Roles | Time line | [date1] | [date2] … ───
    ws.columns = [
      { header: 'No.',       key: 'no',       width: 6  },
      { header: 'Roles',     key: 'roles',    width: 20 },
      { header: 'Time line', key: 'timeline', width: 12 },
      ...sessions.map((s) => ({
        header: this.formatDateLabel(s.date),
        key: s.id,
        width: 26,
      })),
    ];

    const totalCols = 3 + sessions.length;

    // ── Freeze first 3 columns and header row ─────────────────────────────
    ws.views = [
      {
        state: 'frozen' as const,
        xSplit: 3,
        ySplit: 1,
        topLeftCell: 'D2',
        activeCell: 'D2',
      },
    ];

    // ── Header row ────────────────────────────────────────────────────────
    const headerRow = ws.getRow(1);
    headerRow.height = 22;
    for (let c = 1; c <= totalCols; c++) {
      const cell = headerRow.getCell(c);
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4F72' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border    = this.cellBorder();
    }

    // ── Role data rows ────────────────────────────────────────────────────
    for (const rd of ROLE_DEFS) {
      const rowData: Record<string, unknown> = {
        no: rd.no,
        roles: rd.label,
        timeline: rd.timeline,
      };

      for (const s of sessions) {
        const hit = s.assignments.find(
          (a) => a.role === rd.role && a.slot_index === rd.slot,
        );
        if (hit?.member) {
          const name = hit.member.name;
          rowData[s.id] =
            rd.role === OfflineRole.SPEAKER
              ? `${name} (P${hit.member.project_level})`
              : name;
        } else {
          rowData[s.id] = '';
        }
      }

      const row = ws.addRow(rowData);
      row.height = 20;

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        cell.border = this.cellBorder();

        if (rd.bg) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rd.bg } };
        }

        if (c === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 2) {
          cell.font      = { bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (c === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
    }

    // ── Backup Speaker rows ───────────────────────────────────────────────
    const maxBackups = sessions.reduce(
      (max, s) =>
        Math.max(
          max,
          s.assignments.filter((a) => a.role === OfflineRole.BACKUP_SPEAKER).length,
        ),
      0,
    );

    const backupFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF3CD' },
    };

    for (let i = 0; i < maxBackups; i++) {
      const rowData: Record<string, unknown> = { no: '', roles: '', timeline: '' };

      for (const s of sessions) {
        const backups = s.assignments
          .filter((a) => a.role === OfflineRole.BACKUP_SPEAKER)
          .sort((a, b) => a.slot_index - b.slot_index);
        rowData[s.id] = backups[i]?.member?.name ?? '';
      }

      const row = ws.addRow(rowData);
      row.height = 20;
      const rn = row.number;

      // Merge A:C as the label area
      ws.mergeCells(`A${rn}:C${rn}`);
      const labelCell = ws.getCell(`A${rn}`);
      labelCell.value     = i === 0 ? 'Backup Speaker' : '';
      labelCell.font      = { bold: true };
      labelCell.alignment = { vertical: 'middle', horizontal: 'center' };
      labelCell.fill      = backupFill;
      labelCell.border    = this.cellBorder();

      for (let c = 4; c <= totalCols; c++) {
        const cell = row.getCell(c);
        cell.fill      = backupFill;
        cell.border    = this.cellBorder();
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    }
  }

  private buildAnalyticsSheet(
    wb: ExcelJS.Workbook,
    members: Member[],
  ): void {
    const ws = wb.addWorksheet('Member Analytics');

    ws.columns = [
      { header: 'No.',               key: 'no',               width: 6  },
      { header: 'Name',              key: 'name',             width: 26 },
      { header: 'Status',            key: 'status',           width: 10 },
      { header: 'Project Level',     key: 'project_level',    width: 14 },
      { header: 'Main Chairman',     key: 'main_chairman',    width: 16 },
      { header: 'Sub Chairman',      key: 'sub_chairman',     width: 14 },
      { header: 'Speaker (Online)',  key: 'speaker_online',   width: 18 },
      { header: 'Toast Master',      key: 'toast_master',     width: 14 },
      { header: 'Table Tonic',       key: 'table_tonic',      width: 14 },
      { header: 'Speaker (Offline)', key: 'speaker_offline',  width: 18 },
      { header: 'Evaluator',         key: 'evaluator',        width: 12 },
      { header: 'Topic Master',      key: 'topic_master',     width: 14 },
      { header: 'Uh-Ah Counter',     key: 'uh_ah_counter',    width: 15 },
      { header: 'Timer',             key: 'timer',            width: 10 },
      { header: 'General Evaluator', key: 'general_evaluator', width: 18 },
      { header: 'Backup Speaker',    key: 'backup_speaker',   width: 16 },
    ];

    const totalCols = 16;

    // Freeze No. + Name columns and header row
    ws.views = [{ state: 'frozen' as const, xSplit: 2, ySplit: 1, topLeftCell: 'C2', activeCell: 'C2' }];

    this.styleHeader(ws, totalCols);

    // Add a sub-header to group count columns
    const groupRow = ws.addRow([
      '', '', '', '',
      '── Online ──', '',
      '── Offline Roles ──', '', '', '', '', '', '', '', '', '',
    ]);
    groupRow.height = 16;
    groupRow.font   = { italic: true, color: { argb: 'FF555555' }, size: 9 };
    ws.mergeCells(`E2:F2`);
    ws.mergeCells(`G2:P2`);
    for (let c = 1; c <= totalCols; c++) {
      const cell = groupRow.getCell(c);
      cell.border    = this.cellBorder();
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    members.forEach((m, idx) => {
      const rc = m.role_counts ?? {};
      const row = ws.addRow({
        no:              idx + 1,
        name:            m.name,
        status:          m.status,
        project_level:   m.project_level,
        main_chairman:   rc['main_chairman']  ?? 0,
        sub_chairman:    rc['sub_chairman']   ?? 0,
        speaker_online:  rc['speaker']        ?? 0,
        toast_master:    rc['toast_master']   ?? 0,
        table_tonic:     rc['table_tonic']    ?? 0,
        speaker_offline: rc['speaker_offline'] ?? rc['speaker'] ?? 0,
        evaluator:       rc['evaluator']      ?? 0,
        topic_master:    rc['topic_master']   ?? 0,
        uh_ah_counter:   rc['uh_ah_counter']  ?? 0,
        timer:           rc['timer']          ?? 0,
        general_evaluator: rc['general_evaluator'] ?? 0,
        backup_speaker:  rc['backup_speaker'] ?? 0,
      });
      row.height = 20;

      const isEven   = (idx + 1) % 2 === 0;
      const rowFill: ExcelJS.Fill = isEven
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } }
        : { type: 'pattern', pattern: 'none' };
      const statusFill: ExcelJS.Fill =
        m.status === MemberStatus.ACTIVE
          ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }
          : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };

      for (let c = 1; c <= totalCols; c++) {
        const cell = row.getCell(c);
        cell.border = this.cellBorder();
        cell.fill   = c === 3 ? statusFill : rowFill;

        if (c === 1 || (c >= 4 && c <= totalCols)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }

        // Highlight high role counts (≥ 5) in amber
        if (c >= 5 && typeof row.getCell(c).value === 'number') {
          const v = row.getCell(c).value as number;
          if (v >= 5) {
            cell.font = { bold: true, color: { argb: 'FF92400E' } };
            if (cell.fill.type === 'pattern' && (cell.fill as ExcelJS.FillPattern).fgColor?.argb === 'FFF0F4FF') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
            } else if (cell.fill.type === 'pattern' && (cell.fill as ExcelJS.FillPattern).pattern === 'none') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
            }
          }
        }
      }
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** "2026-04-24" → "24-Apr" */
  private formatDateLabel(dateStr: string): string {
    const parts = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(parts[2], 10)}-${months[parseInt(parts[1], 10) - 1]}`;
  }

  private cellBorder(): Partial<ExcelJS.Borders> {
    const b: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: b, left: b, bottom: b, right: b };
  }

  private styleHeader(ws: ExcelJS.Worksheet, totalCols?: number): void {
    const headerRow = ws.getRow(1);
    headerRow.height = 22;
    headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B4F72' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    if (totalCols) {
      for (let c = 1; c <= totalCols; c++) {
        headerRow.getCell(c).border = this.cellBorder();
      }
    } else {
      headerRow.eachCell((cell) => { cell.border = this.cellBorder(); });
    }
  }

  // ─── Analytics helpers ─────────────────────────────────────────────────────

  getMemberStatusSummary(
    members: Member[],
  ): { active: number; leave: number } {
    return {
      active: members.filter((m) => m.status === MemberStatus.ACTIVE).length,
      leave: members.filter((m) => m.status === MemberStatus.LEAVE).length,
    };
  }
}
