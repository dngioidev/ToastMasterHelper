import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { OnlineSession } from './online-session.entity';
import { CreateOnlineSessionDto } from './dto/create-online-session.dto';
import { UpdateOnlineSessionDto } from './dto/update-online-session.dto';
import { MembersService } from '../members/members.service';
import { Member, MemberStatus } from '../members/member.entity';
import {
  OfflineRole,
  OfflineSessionAssignment,
} from '../offline-sessions/offline-session-assignment.entity';

export interface SuggestResult {
  main_chairman: Member | null;
  sub_chairman: Member | null;
  speaker1: Member | null;
  speaker2: Member | null;
}

@Injectable()
export class OnlineSessionsService {
  constructor(
    @InjectRepository(OnlineSession)
    private readonly sessionRepository: Repository<OnlineSession>,
    @InjectRepository(OfflineSessionAssignment)
    private readonly offlineAssignmentRepository: Repository<OfflineSessionAssignment>,
    private readonly membersService: MembersService,
  ) {}

  async findAll(): Promise<OnlineSession[]> {
    return this.sessionRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OnlineSession> {
    const session = await this.sessionRepository.findOneBy({ id });
    if (!session) {
      throw new NotFoundException(`Online session ${id} not found`);
    }
    return session;
  }

  async create(dto: CreateOnlineSessionDto): Promise<OnlineSession> {
    const existing = await this.sessionRepository.findOneBy({ date: dto.date });
    if (existing) {
      throw new BadRequestException(
        `An online session already exists for date ${dto.date}`,
      );
    }
    const session = this.sessionRepository.create(dto);
    const saved = await this.sessionRepository.save(session);
    if (dto.main_chairman_id) {
      await this.membersService.incrementRoleCount(
        dto.main_chairman_id,
        'main_chairman',
      );
    }
    if (dto.sub_chairman_id) {
      await this.membersService.incrementRoleCount(
        dto.sub_chairman_id,
        'sub_chairman',
      );
    }
    if (dto.speaker1_id) {
      await this.membersService.incrementRoleCount(dto.speaker1_id, 'speaker');
    }
    if (dto.speaker2_id) {
      await this.membersService.incrementRoleCount(dto.speaker2_id, 'speaker');
    }
    return saved;
  }

  async update(
    id: string,
    dto: UpdateOnlineSessionDto,
  ): Promise<OnlineSession> {
    await this.findOne(id); // throws 404 if not found
    await this.sessionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepository.remove(session);
  }

  async suggest(date: string): Promise<SuggestResult> {
    // Separate pools: chairman-tagged members vs speaker-tagged members
    const chairmenPool = await this.membersService.findOnlineChairmen();
    const speakersPool = await this.membersService.findOnlineSpeakers();

    // Get the 2 most recent sessions to apply chairman exclusion rule
    const recentSessions = await this.sessionRepository.find({
      where: {},
      order: { date: 'DESC' },
      take: 2,
    });
    const recentMainChairmanIds = new Set(
      recentSessions
        .map((s) => s.main_chairman_id)
        .filter((id): id is string => id !== null),
    );

    // Build 2-week speaker exclusion set
    const target = new Date(date);
    const windowStart = new Date(target);
    windowStart.setDate(windowStart.getDate() - 14);
    const windowEnd = new Date(target);
    windowEnd.setDate(windowEnd.getDate() + 14);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const recentSpeakerIds = new Set<string>();

    // Online sessions in window (speaker1/speaker2)
    const onlineInWindow = await this.sessionRepository.find({
      where: { date: Between(fmt(windowStart), fmt(windowEnd)) },
    });
    for (const s of onlineInWindow) {
      if (s.speaker1_id) recentSpeakerIds.add(s.speaker1_id);
      if (s.speaker2_id) recentSpeakerIds.add(s.speaker2_id);
    }

    // Offline assignments in window (speaker + backup_speaker)
    const offlineSpeakerAssignments = await this.offlineAssignmentRepository.find({
      where: [
        { role: OfflineRole.SPEAKER, session: { date: Between(fmt(windowStart), fmt(windowEnd)) } },
        { role: OfflineRole.BACKUP_SPEAKER, session: { date: Between(fmt(windowStart), fmt(windowEnd)) } },
      ],
      relations: ['session'],
    });
    for (const a of offlineSpeakerAssignments) {
      if (a.member_id) recentSpeakerIds.add(a.member_id);
    }

    // Main chairman: from chairmenPool, exclude those in last 2 sessions
    const mainChairmanCandidates = [...chairmenPool]
      .filter((m) => !recentMainChairmanIds.has(m.id))
      .sort((a, b) => {
        const aCount = a.role_counts?.['main_chairman'] ?? 0;
        const bCount = b.role_counts?.['main_chairman'] ?? 0;
        if (aCount !== bCount) return aCount - bCount;
        return a.name.localeCompare(b.name);
      });

    const mainChairman = mainChairmanCandidates[0] ?? null;

    // Sub chairman: from chairmenPool, exclude main chairman
    const subChairmanCandidates = [...chairmenPool]
      .filter((m) => m.id !== mainChairman?.id)
      .sort((a, b) => {
        const aCount = a.role_counts?.['sub_chairman'] ?? 0;
        const bCount = b.role_counts?.['sub_chairman'] ?? 0;
        if (aCount !== bCount) return aCount - bCount;
        return a.name.localeCompare(b.name);
      });

    const subChairman = subChairmanCandidates[0] ?? null;

    // Speakers: from speakersPool only, project_level < 10,
    // exclude anyone already assigned as chairman (cross-pool guard)
    // and exclude anyone who was a speaker in the ±14-day window
    const assignedIds = new Set(
      [mainChairman?.id, subChairman?.id].filter(Boolean) as string[],
    );

    const speakerCandidates = speakersPool
      .filter(
        (m) =>
          m.project_level < 10 &&
          !assignedIds.has(m.id) &&
          !recentSpeakerIds.has(m.id),
      )
      .sort((a, b) => {
        const aCount = a.role_counts?.['speaker'] ?? 0;
        const bCount = b.role_counts?.['speaker'] ?? 0;
        if (aCount !== bCount) return aCount - bCount;
        return a.name.localeCompare(b.name);
      });

    const speaker1 = speakerCandidates[0] ?? null;
    const speaker2 = speakerCandidates[1] ?? null;

    return { main_chairman: mainChairman, sub_chairman: subChairman, speaker1, speaker2 };
  }
}
