import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnlineSession } from './online-session.entity';
import { CreateOnlineSessionDto } from './dto/create-online-session.dto';
import { UpdateOnlineSessionDto } from './dto/update-online-session.dto';
import { MembersService } from '../members/members.service';
import { Member, MemberStatus } from '../members/member.entity';

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
    const session = await this.findOne(id);
    Object.assign(session, dto);
    return this.sessionRepository.save(session);
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
    const assignedIds = new Set(
      [mainChairman?.id, subChairman?.id].filter(Boolean) as string[],
    );

    const speakerCandidates = speakersPool
      .filter((m) => m.project_level < 10 && !assignedIds.has(m.id))
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
