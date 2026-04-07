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
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Project Level', key: 'project_level', width: 15 },
      { header: 'Online Chairman', key: 'online_as_chairman', width: 18 },
      { header: 'Online Speaker', key: 'online_as_speaker', width: 16 },
      { header: 'Attends Offline', key: 'attends_offline', width: 16 },
    ];

    this.styleHeader(ws);

    for (const m of members) {
      ws.addRow({
        name: m.name,
        status: m.status,
        project_level: m.project_level,
        online_as_chairman: m.online_as_chairman ? 'Yes' : 'No',
        online_as_speaker: m.online_as_speaker ? 'Yes' : 'No',
        attends_offline: m.attends_offline ? 'Yes' : 'No',
      });
    }
  }

  private buildOnlineSheet(
    wb: ExcelJS.Workbook,
    sessions: OnlineSession[],
  ): void {
    const ws = wb.addWorksheet('Online Sessions');

    ws.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Main Chairman', key: 'main_chairman', width: 22 },
      { header: 'Sub Chairman', key: 'sub_chairman', width: 22 },
      { header: 'Speaker 1', key: 'speaker1', width: 22 },
      { header: 'Speaker 2', key: 'speaker2', width: 22 },
      { header: 'Notes', key: 'notes', width: 35 },
    ];

    this.styleHeader(ws);

    for (const s of sessions) {
      ws.addRow({
        date: s.date,
        main_chairman: s.main_chairman?.name ?? '',
        sub_chairman: s.sub_chairman?.name ?? '',
        speaker1: s.speaker1?.name ?? '',
        speaker2: s.speaker2?.name ?? '',
        notes: s.notes ?? '',
      });
    }
  }

  private buildOfflineSheet(
    wb: ExcelJS.Workbook,
    sessions: OfflineSession[],
  ): void {
    const ws = wb.addWorksheet('Offline Sessions');

    ws.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Cancelled', key: 'cancelled', width: 12 },
      { header: 'Toast Master', key: 'toast_master', width: 22 },
      { header: 'Table Tonic', key: 'table_tonic', width: 22 },
      { header: 'Speaker 1', key: 'speaker1', width: 22 },
      { header: 'Speaker 2', key: 'speaker2', width: 22 },
      { header: 'Evaluator 1', key: 'evaluator1', width: 22 },
      { header: 'Evaluator 2', key: 'evaluator2', width: 22 },
      { header: 'Topic Master', key: 'topic_master', width: 22 },
      { header: 'Uh-Ah Counter', key: 'uh_ah_counter', width: 16 },
      { header: 'Timer', key: 'timer', width: 16 },
      { header: 'General Evaluator', key: 'general_evaluator', width: 22 },
      { header: 'Backup Speaker 1', key: 'backup1', width: 22 },
      { header: 'Backup Speaker 2', key: 'backup2', width: 22 },
      { header: 'Notes', key: 'notes', width: 35 },
    ];

    this.styleHeader(ws);

    for (const s of sessions) {
      const byRole = (role: OfflineRole) =>
        s.assignments
          .filter((a) => a.role === role)
          .sort((a, b) => a.slot_index - b.slot_index);

      const speakers = byRole(OfflineRole.SPEAKER);
      const evaluators = byRole(OfflineRole.EVALUATOR);
      const backups = byRole(OfflineRole.BACKUP_SPEAKER);
      const single = (role: OfflineRole) =>
        byRole(role)[0]?.member?.name ?? '';

      ws.addRow({
        date: s.date,
        cancelled: s.is_cancelled ? 'Yes' : 'No',
        toast_master: single(OfflineRole.TOAST_MASTER),
        table_tonic: single(OfflineRole.TABLE_TONIC),
        speaker1: speakers[0]?.member?.name ?? '',
        speaker2: speakers[1]?.member?.name ?? '',
        evaluator1: evaluators[0]?.member?.name ?? '',
        evaluator2: evaluators[1]?.member?.name ?? '',
        topic_master: single(OfflineRole.TOPIC_MASTER),
        uh_ah_counter: single(OfflineRole.UH_AH_COUNTER),
        timer: single(OfflineRole.TIMER),
        general_evaluator: single(OfflineRole.GENERAL_EVALUATOR),
        backup1: backups[0]?.member?.name ?? '',
        backup2: backups[1]?.member?.name ?? '',
        notes: s.notes ?? '',
      });
    }
  }

  private buildAnalyticsSheet(
    wb: ExcelJS.Workbook,
    members: Member[],
  ): void {
    const ws = wb.addWorksheet('Member Analytics');

    ws.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Project Level', key: 'project_level', width: 14 },
      { header: 'Main Chairman', key: 'main_chairman', width: 16 },
      { header: 'Sub Chairman', key: 'sub_chairman', width: 14 },
      { header: 'Speaker (Online)', key: 'speaker_online', width: 18 },
      { header: 'Toast Master', key: 'toast_master', width: 14 },
      { header: 'Table Tonic', key: 'table_tonic', width: 14 },
      { header: 'Speaker (Offline)', key: 'speaker_offline', width: 18 },
      { header: 'Evaluator', key: 'evaluator', width: 12 },
      { header: 'Topic Master', key: 'topic_master', width: 14 },
      { header: 'Uh-Ah Counter', key: 'uh_ah_counter', width: 15 },
      { header: 'Timer', key: 'timer', width: 10 },
      { header: 'General Evaluator', key: 'general_evaluator', width: 18 },
      { header: 'Backup Speaker', key: 'backup_speaker', width: 16 },
    ];

    this.styleHeader(ws);

    for (const m of members) {
      const rc = m.role_counts ?? {};
      ws.addRow({
        name: m.name,
        status: m.status,
        project_level: m.project_level,
        main_chairman: rc['main_chairman'] ?? 0,
        sub_chairman: rc['sub_chairman'] ?? 0,
        speaker_online: rc['speaker'] ?? 0,
        toast_master: rc['toast_master'] ?? 0,
        table_tonic: rc['table_tonic'] ?? 0,
        speaker_offline: rc['speaker_offline'] ?? rc['speaker'] ?? 0,
        evaluator: rc['evaluator'] ?? 0,
        topic_master: rc['topic_master'] ?? 0,
        uh_ah_counter: rc['uh_ah_counter'] ?? 0,
        timer: rc['timer'] ?? 0,
        general_evaluator: rc['general_evaluator'] ?? 0,
        backup_speaker: rc['backup_speaker'] ?? 0,
      });
    }

    // Zebra-stripe rows
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const fill: ExcelJS.Fill =
        rowNumber % 2 === 0
          ? {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F5F5' },
            }
          : { type: 'pattern', pattern: 'none' };
      row.eachCell((cell) => {
        cell.fill = fill;
      });
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private styleHeader(ws: ExcelJS.Worksheet): void {
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1D4ED8' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
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
