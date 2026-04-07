import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OfflineSessionsService } from './offline-sessions.service';
import { OfflineSession } from './offline-session.entity';
import {
  OfflineRole,
  OfflineSessionAssignment,
} from './offline-session-assignment.entity';
import { MembersService } from '../members/members.service';
import { Member, MemberStatus } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';

const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'uuid-default',
  name: 'Default Member',
  status: MemberStatus.ACTIVE,
  project_level: 3,
  role_counts: {},
  online_as_chairman: true,
  online_as_speaker: true,
  attends_offline: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const makeSessionRepo = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeAssignmentRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
});

const makeOnlineSessionRepo = () => ({
  find: jest.fn().mockResolvedValue([]),
});

const makeMembersService = () => ({
  findOfflineMembers: jest.fn(),
  incrementRoleCount: jest.fn().mockResolvedValue(undefined),
  incrementProjectLevel: jest.fn().mockResolvedValue(undefined),
});

describe('OfflineSessionsService', () => {
  let service: OfflineSessionsService;
  let sessionRepo: ReturnType<typeof makeSessionRepo>;
  let assignmentRepo: ReturnType<typeof makeAssignmentRepo>;
  let membersService: ReturnType<typeof makeMembersService>;

  beforeEach(async () => {
    sessionRepo = makeSessionRepo();
    assignmentRepo = makeAssignmentRepo();
    membersService = makeMembersService();
    const onlineSessionRepo = makeOnlineSessionRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfflineSessionsService,
        {
          provide: getRepositoryToken(OfflineSession),
          useValue: sessionRepo,
        },
        {
          provide: getRepositoryToken(OfflineSessionAssignment),
          useValue: assignmentRepo,
        },
        {
          provide: getRepositoryToken(OnlineSession),
          useValue: onlineSessionRepo,
        },
        { provide: MembersService, useValue: membersService },
      ],
    }).compile();
    service = module.get<OfflineSessionsService>(OfflineSessionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      sessionRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if date already taken', async () => {
      sessionRepo.findOneBy.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ date: '2026-04-10' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save session and assignments, increment role counts', async () => {
      sessionRepo.findOneBy
        .mockResolvedValueOnce(null) // create check
        .mockResolvedValueOnce({ id: 'sess-1', assignments: [] }); // findOne at end
      const session = { id: 'sess-1' } as OfflineSession;
      sessionRepo.create.mockReturnValue(session);
      sessionRepo.save.mockResolvedValue(session);
      const assignment = {
        session_id: 'sess-1',
        member_id: 'mem-1',
        role: OfflineRole.TOAST_MASTER,
        slot_index: 0,
        passed: false,
      } as OfflineSessionAssignment;
      assignmentRepo.create.mockReturnValue(assignment);
      assignmentRepo.save.mockResolvedValue([assignment]);

      await service.create({
        date: '2026-04-10',
        assignments: [{ member_id: 'mem-1', role: OfflineRole.TOAST_MASTER }],
      });

      expect(membersService.incrementRoleCount).toHaveBeenCalledWith(
        'mem-1',
        OfflineRole.TOAST_MASTER,
      );
    });

    it('should increment project_level when speaker passes', async () => {
      sessionRepo.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'sess-1', assignments: [] });
      const session = { id: 'sess-1' } as OfflineSession;
      sessionRepo.create.mockReturnValue(session);
      sessionRepo.save.mockResolvedValue(session);
      const assignment = {
        session_id: 'sess-1',
        member_id: 'mem-1',
        role: OfflineRole.SPEAKER,
        slot_index: 0,
        passed: true,
      } as OfflineSessionAssignment;
      assignmentRepo.create.mockReturnValue(assignment);
      assignmentRepo.save.mockResolvedValue([assignment]);

      await service.create({
        date: '2026-04-10',
        assignments: [
          { member_id: 'mem-1', role: OfflineRole.SPEAKER, passed: true },
        ],
      });

      expect(membersService.incrementProjectLevel).toHaveBeenCalledWith('mem-1');
    });
  });

  describe('suggest', () => {
    it('should only suggest eligible speakers (project_level < 10)', async () => {
      const members = [
        makeMember({ id: 'alice', name: 'Alice', project_level: 10 }),
        makeMember({ id: 'bob', name: 'Bob', project_level: 3 }),
        makeMember({ id: 'charlie', name: 'Charlie', project_level: 5 }),
        makeMember({ id: 'diana', name: 'Diana', project_level: 7 }),
        makeMember({ id: 'eve', name: 'Eve', project_level: 8 }),
        makeMember({ id: 'frank', name: 'Frank', project_level: 9 }),
      ];
      membersService.findOfflineMembers.mockResolvedValue(members);
      const result = await service.suggest(2, 1);
      const speakerIds = result.speakers.map((s) => s.id);
      expect(speakerIds).not.toContain('alice');
    });

    it('should enforce evaluator level > speaker level', async () => {
      // Use project_level 10 for fillers so they're excluded as speakers
      // Only 'speaker' (lv 4) will be eligible as speaker (project_level < 10)
      const speaker = makeMember({ id: 'sp', name: 'AAA-Speaker', project_level: 4 });
      const lowEval = makeMember({ id: 'low', name: 'BBB-Low', project_level: 4 });
      const highEval = makeMember({ id: 'high', name: 'CCC-High', project_level: 5 });
      const filler = Array.from({ length: 8 }, (_, i) =>
        makeMember({ id: `f${i}`, name: `Filler${i}`, project_level: 10 }),
      );
      membersService.findOfflineMembers.mockResolvedValue([
        speaker,
        lowEval,
        highEval,
        ...filler,
      ]);
      const result = await service.suggest(1, 0);
      // 'lowEval' has level 4 which equals speaker level 4 — NOT eligible
      expect(result.evaluators[0]?.id).not.toBe('low');
      // evaluator must have level > 4; 'highEval' (lv 5) should be chosen
      expect(result.evaluators[0]).not.toBeNull();
      if (result.evaluators[0]) {
        expect(result.evaluators[0].project_level).toBeGreaterThan(
          result.speakers[0].project_level,
        );
      }
    });

    it('should not assign same member to multiple roles', async () => {
      const members = Array.from({ length: 12 }, (_, i) =>
        makeMember({ id: `m${i}`, name: `Member${i}`, project_level: 3 + (i % 5) }),
      );
      membersService.findOfflineMembers.mockResolvedValue(members);
      const result = await service.suggest(2, 1);
      const allAssigned = [
        result.toast_master?.id,
        result.table_tonic?.id,
        ...result.speakers.map((s) => s.id),
        ...result.evaluators.map((e) => e?.id).filter(Boolean),
        result.topic_master?.id,
        result.uh_ah_counter?.id,
        result.timer?.id,
        result.general_evaluator?.id,
        ...result.backup_speakers.map((b) => b.id),
      ].filter(Boolean) as string[];
      const unique = new Set(allAssigned);
      expect(unique.size).toBe(allAssigned.length);
    });
  });
});
