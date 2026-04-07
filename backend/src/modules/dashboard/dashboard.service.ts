import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberStatus } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';

export interface MemberStats {
  id: string;
  name: string;
  status: MemberStatus;
  project_level: number;
  role_counts: Record<string, number>;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  leave_members: number;
  total_online_sessions: number;
  total_offline_sessions: number;
  next_online_session: string | null;
  next_offline_session: string | null;
  top_members: MemberStats[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(OnlineSession)
    private readonly onlineSessionRepository: Repository<OnlineSession>,
    @InjectRepository(OfflineSession)
    private readonly offlineSessionRepository: Repository<OfflineSession>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];

    const [totalMembers, activeMembers] = await Promise.all([
      this.memberRepository.count(),
      this.memberRepository.count({
        where: { status: MemberStatus.ACTIVE },
      }),
    ]);

    const [totalOnline, totalOffline] = await Promise.all([
      this.onlineSessionRepository.count(),
      this.offlineSessionRepository.count(),
    ]);

    const nextOnlineSession = await this.onlineSessionRepository
      .createQueryBuilder('s')
      .where('s.date >= :today', { today })
      .andWhere('s.is_cancelled = false')
      .orderBy('s.date', 'ASC')
      .select('s.date')
      .getOne();

    const nextOfflineSession = await this.offlineSessionRepository
      .createQueryBuilder('s')
      .where('s.date >= :today', { today })
      .andWhere('s.is_cancelled = false')
      .orderBy('s.date', 'ASC')
      .select('s.date')
      .getOne();

    const topMembers = await this.memberRepository.find({
      where: { status: MemberStatus.ACTIVE },
      order: { name: 'ASC' },
      take: 10,
    });

    return {
      total_members: totalMembers,
      active_members: activeMembers,
      leave_members: totalMembers - activeMembers,
      total_online_sessions: totalOnline,
      total_offline_sessions: totalOffline,
      next_online_session: nextOnlineSession?.date ?? null,
      next_offline_session: nextOfflineSession?.date ?? null,
      top_members: topMembers.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        project_level: m.project_level,
        role_counts: m.role_counts,
      })),
    };
  }
}
