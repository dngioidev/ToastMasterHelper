import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Member } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { OfflineSessionAssignment } from '../offline-sessions/offline-session-assignment.entity';

export interface BackupPayload {
  version: string;
  exported_at: string;
  data: {
    members: Record<string, unknown>[];
    online_sessions: Record<string, unknown>[];
    offline_sessions: Record<string, unknown>[];
    offline_session_assignments: Record<string, unknown>[];
  };
}

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(OnlineSession)
    private readonly onlineRepo: Repository<OnlineSession>,
    @InjectRepository(OfflineSession)
    private readonly offlineRepo: Repository<OfflineSession>,
    @InjectRepository(OfflineSessionAssignment)
    private readonly assignmentRepo: Repository<OfflineSessionAssignment>,
    private readonly dataSource: DataSource,
  ) {}

  async generateBackup(): Promise<BackupPayload> {
    const [members, online, offline, assignments] = await Promise.all([
      this.memberRepo.find({ order: { name: 'ASC' } }),
      this.onlineRepo.find({ order: { date: 'ASC' } }),
      this.offlineRepo.find({ order: { date: 'ASC' } }),
      this.assignmentRepo.find({ order: { session_id: 'ASC', slot_index: 'ASC' } }),
    ]);

    // Strip eager-loaded relations — keep only scalar + FK columns
    const cleanMembers = members.map(({ ...m }) => m);
    const cleanOnline = online.map(
      ({ main_chairman, sub_chairman, speaker1, speaker2, ...s }) => s,
    );
    const cleanOffline = offline.map(({ assignments: _a, ...s }) => s);
    const cleanAssignments = assignments.map(
      ({ session, member, ...a }) => a,
    );

    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      data: {
        members: cleanMembers as unknown as Record<string, unknown>[],
        online_sessions: cleanOnline as unknown as Record<string, unknown>[],
        offline_sessions: cleanOffline as unknown as Record<string, unknown>[],
        offline_session_assignments: cleanAssignments as unknown as Record<
          string,
          unknown
        >[],
      },
    };
  }

  async restoreBackup(payload: BackupPayload): Promise<{ restored: number }> {
    const { data } = payload;

    if (
      !Array.isArray(data.members) ||
      !Array.isArray(data.online_sessions) ||
      !Array.isArray(data.offline_sessions) ||
      !Array.isArray(data.offline_session_assignments)
    ) {
      throw new BadRequestException(
        'Invalid backup format: data arrays are missing',
      );
    }

    const total =
      data.members.length +
      data.online_sessions.length +
      data.offline_sessions.length +
      data.offline_session_assignments.length;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // Delete in FK-safe order
      await qr.manager.delete(OfflineSessionAssignment, {});
      await qr.manager.delete(OfflineSession, {});
      await qr.manager.delete(OnlineSession, {});
      await qr.manager.delete(Member, {});

      // Restore in dependency order
      if (data.members.length > 0) {
        await qr.manager
          .createQueryBuilder()
          .insert()
          .into(Member)
          .values(data.members as unknown as Member[])
          .execute();
      }

      if (data.online_sessions.length > 0) {
        await qr.manager
          .createQueryBuilder()
          .insert()
          .into(OnlineSession)
          .values(data.online_sessions as unknown as OnlineSession[])
          .execute();
      }

      if (data.offline_sessions.length > 0) {
        await qr.manager
          .createQueryBuilder()
          .insert()
          .into(OfflineSession)
          .values(data.offline_sessions as unknown as OfflineSession[])
          .execute();
      }

      if (data.offline_session_assignments.length > 0) {
        await qr.manager
          .createQueryBuilder()
          .insert()
          .into(OfflineSessionAssignment)
          .values(
            data.offline_session_assignments as unknown as OfflineSessionAssignment[],
          )
          .execute();
      }

      await qr.commitTransaction();
      return { restored: total };
    } catch (err) {
      await qr.rollbackTransaction();
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new InternalServerErrorException(`Restore failed: ${message}`);
    } finally {
      await qr.release();
    }
  }
}
