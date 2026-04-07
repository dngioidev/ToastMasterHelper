import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { OfflineSession } from './offline-session.entity';
import {
  OfflineRole,
  OfflineSessionAssignment,
} from './offline-session-assignment.entity';
import { CreateOfflineSessionDto } from './dto/create-offline-session.dto';
import { UpdateOfflineSessionDto } from './dto/update-offline-session.dto';
import { MembersService } from '../members/members.service';
import { Member } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';

export interface OfflineSuggestResult {
  toast_master: Member | null;
  table_tonic: Member | null;
  speakers: Member[];
  evaluators: (Member | null)[];
  topic_master: Member | null;
  uh_ah_counter: Member | null;
  timer: Member | null;
  general_evaluator: Member | null;
  backup_speakers: Member[];
}

@Injectable()
export class OfflineSessionsService {
  constructor(
    @InjectRepository(OfflineSession)
    private readonly sessionRepository: Repository<OfflineSession>,
    @InjectRepository(OfflineSessionAssignment)
    private readonly assignmentRepository: Repository<OfflineSessionAssignment>,
    @InjectRepository(OnlineSession)
    private readonly onlineSessionRepository: Repository<OnlineSession>,
    private readonly membersService: MembersService,
  ) {}

  async findAll(): Promise<OfflineSession[]> {
    return this.sessionRepository.find({ order: { date: 'ASC' } });
  }

  async findOne(id: string): Promise<OfflineSession> {
    const session = await this.sessionRepository.findOneBy({ id });
    if (!session) {
      throw new NotFoundException(`Offline session ${id} not found`);
    }
    return session;
  }

  async create(dto: CreateOfflineSessionDto): Promise<OfflineSession> {
    const existing = await this.sessionRepository.findOneBy({ date: dto.date });
    if (existing) {
      throw new BadRequestException(
        `An offline session already exists for date ${dto.date}`,
      );
    }
    const { assignments: assignmentDtos, ...sessionData } = dto;
    const session = this.sessionRepository.create({
      ...sessionData,
      num_speakers: dto.num_speakers ?? 2,
      num_backup_speakers: dto.num_backup_speakers ?? 1,
      assignments: [],
    });
    const saved = await this.sessionRepository.save(session);

    if (assignmentDtos?.length) {
      const assignments = assignmentDtos.map((a) =>
        this.assignmentRepository.create({
          session_id: saved.id,
          member_id: a.member_id ?? null,
          role: a.role,
          slot_index: a.slot_index ?? 0,
          passed: a.passed ?? false,
        }),
      );
      await this.assignmentRepository.save(assignments);

      // Increment role counts and handle passed speakers
      for (const a of assignments) {
        if (a.member_id) {
          await this.membersService.incrementRoleCount(a.member_id, a.role);
          if (a.role === OfflineRole.SPEAKER && a.passed) {
            await this.membersService.incrementProjectLevel(a.member_id);
          }
        }
      }
    }

    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateOfflineSessionDto,
  ): Promise<OfflineSession> {
    const session = await this.findOne(id);
    const { assignments: assignmentDtos, ...sessionData } = dto;
    Object.assign(session, sessionData);
    await this.sessionRepository.save(session);

    if (assignmentDtos !== undefined) {
      // Replace all assignments
      await this.assignmentRepository.delete({ session_id: id });
      if (assignmentDtos.length) {
        const assignments = assignmentDtos.map((a) =>
          this.assignmentRepository.create({
            session_id: id,
            member_id: a.member_id ?? null,
            role: a.role,
            slot_index: a.slot_index ?? 0,
            passed: a.passed ?? false,
          }),
        );
        await this.assignmentRepository.save(assignments);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepository.remove(session);
  }

  async suggest(
    numSpeakers = 2,
    numBackup = 1,
    date?: string,
  ): Promise<OfflineSuggestResult> {
    const activeMembers = await this.membersService.findOfflineMembers();
    const assigned = new Set<string>();

    // Build 2-week exclusion sets when a date is provided
    let recentSpeakerIds = new Set<string>();
    let recentEvaluatorIds = new Set<string>();

    if (date) {
      const target = new Date(date);
      const windowStart = new Date(target);
      windowStart.setDate(windowStart.getDate() - 14);
      const windowEnd = new Date(target);
      windowEnd.setDate(windowEnd.getDate() + 14);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      // Offline speaker + backup_speaker in window
      const offlineSpeakerAssignments = await this.assignmentRepository.find({
        where: [
          { role: OfflineRole.SPEAKER, session: { date: Between(fmt(windowStart), fmt(windowEnd)) } },
          { role: OfflineRole.BACKUP_SPEAKER, session: { date: Between(fmt(windowStart), fmt(windowEnd)) } },
        ],
        relations: ['session'],
      });
      for (const a of offlineSpeakerAssignments) {
        if (a.member_id) recentSpeakerIds.add(a.member_id);
      }

      // Online speaker1/speaker2 in window
      const onlineSessions = await this.onlineSessionRepository.find({
        where: { date: Between(fmt(windowStart), fmt(windowEnd)) },
      });
      for (const s of onlineSessions) {
        if (s.speaker1_id) recentSpeakerIds.add(s.speaker1_id);
        if (s.speaker2_id) recentSpeakerIds.add(s.speaker2_id);
      }

      // Offline evaluator in window
      const evaluatorAssignments = await this.assignmentRepository.find({
        where: { role: OfflineRole.EVALUATOR, session: { date: Between(fmt(windowStart), fmt(windowEnd)) } },
        relations: ['session'],
      });
      for (const a of evaluatorAssignments) {
        if (a.member_id) recentEvaluatorIds.add(a.member_id);
      }
    }

    const pickOne = (
      sortKey: string,
      filter?: (m: Member) => boolean,
    ): Member | null => {
      const candidates = activeMembers
        .filter((m) => !assigned.has(m.id) && (filter ? filter(m) : true))
        .sort((a, b) => {
          const aCount = a.role_counts?.[sortKey] ?? 0;
          const bCount = b.role_counts?.[sortKey] ?? 0;
          if (aCount !== bCount) return aCount - bCount;
          return a.name.localeCompare(b.name);
        });
      const picked = candidates[0] ?? null;
      if (picked) assigned.add(picked.id);
      return picked;
    };

    const pickMany = (
      sortKey: string,
      count: number,
      filter?: (m: Member) => boolean,
    ): Member[] => {
      const results: Member[] = [];
      const candidates = activeMembers
        .filter((m) => !assigned.has(m.id) && (filter ? filter(m) : true))
        .sort((a, b) => {
          const aCount = a.role_counts?.[sortKey] ?? 0;
          const bCount = b.role_counts?.[sortKey] ?? 0;
          if (aCount !== bCount) return aCount - bCount;
          return a.name.localeCompare(b.name);
        });
      for (let i = 0; i < count && i < candidates.length; i++) {
        results.push(candidates[i]);
        assigned.add(candidates[i].id);
      }
      return results;
    };

    const toast_master = pickOne('toast_master');
    const table_tonic = pickOne('table_tonic');

    const speakers = pickMany(
      'speaker',
      numSpeakers,
      (m) => m.project_level < 10 && !recentSpeakerIds.has(m.id),
    );

    // Each evaluator must have project_level > their paired speaker
    const evaluators: (Member | null)[] = speakers.map((speaker) => {
      const speakerLevel = speaker.project_level;
      const candidates = activeMembers
        .filter(
          (m) =>
            !assigned.has(m.id) &&
            m.project_level > speakerLevel &&
            !recentEvaluatorIds.has(m.id),
        )
        .sort((a, b) => {
          const aCount = a.role_counts?.['evaluator'] ?? 0;
          const bCount = b.role_counts?.['evaluator'] ?? 0;
          if (aCount !== bCount) return aCount - bCount;
          return a.name.localeCompare(b.name);
        });
      const picked = candidates[0] ?? null;
      if (picked) assigned.add(picked.id);
      return picked;
    });

    const topic_master = pickOne('topic_master');
    const uh_ah_counter = pickOne('uh_ah_counter');
    const timer = pickOne('timer');
    const general_evaluator = pickOne('general_evaluator');

    const backup_speakers = pickMany(
      'backup_speaker',
      numBackup,
      (m) => m.project_level < 10 && !recentSpeakerIds.has(m.id),
    );

    return {
      toast_master,
      table_tonic,
      speakers,
      evaluators,
      topic_master,
      uh_ah_counter,
      timer,
      general_evaluator,
      backup_speakers,
    };
  }
}
