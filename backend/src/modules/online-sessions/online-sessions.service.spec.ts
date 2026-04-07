import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OnlineSessionsService } from './online-sessions.service';
import { OnlineSession } from './online-session.entity';
import { MembersService } from '../members/members.service';
import { Member, MemberStatus } from '../members/member.entity';
import { OfflineSessionAssignment } from '../offline-sessions/offline-session-assignment.entity';

const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'uuid-1',
  name: 'Alice',
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

const makeRepo = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeMembersService = () => ({
  findOnlineChairmen: jest.fn(),
  findOnlineSpeakers: jest.fn(),
  findEligibleSpeakers: jest.fn(),
  incrementRoleCount: jest.fn().mockResolvedValue(undefined),
  findOne: jest.fn(),
});

describe('OnlineSessionsService', () => {
  let service: OnlineSessionsService;
  let repo: ReturnType<typeof makeRepo>;
  let membersService: ReturnType<typeof makeMembersService>;

  beforeEach(async () => {
    repo = makeRepo();
    membersService = makeMembersService();
    const offlineAssignmentRepo = { find: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnlineSessionsService,
        { provide: getRepositoryToken(OnlineSession), useValue: repo },
        {
          provide: getRepositoryToken(OfflineSessionAssignment),
          useValue: offlineAssignmentRepo,
        },
        { provide: MembersService, useValue: membersService },
      ],
    }).compile();
    service = module.get<OnlineSessionsService>(OnlineSessionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException if session not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if session date already exists', async () => {
      repo.findOneBy.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ date: '2026-04-08' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and increment role counts', async () => {
      repo.findOneBy.mockResolvedValue(null);
      const session = { id: 'new-id', date: '2026-04-08' } as OnlineSession;
      repo.create.mockReturnValue(session);
      repo.save.mockResolvedValue(session);
      await service.create({
        date: '2026-04-08',
        main_chairman_id: 'mc-id',
        speaker1_id: 'sp1-id',
      });
      expect(membersService.incrementRoleCount).toHaveBeenCalledWith(
        'mc-id',
        'main_chairman',
      );
      expect(membersService.incrementRoleCount).toHaveBeenCalledWith(
        'sp1-id',
        'speaker',
      );
    });
  });

  describe('suggest', () => {
    it('should suggest main chairman excluding last 2 session chairs', async () => {
      const alice = makeMember({ id: 'alice', name: 'Alice', role_counts: { main_chairman: 1 } });
      const bob = makeMember({ id: 'bob', name: 'Bob', role_counts: { main_chairman: 0 } });
      const charlie = makeMember({ id: 'charlie', name: 'Charlie', role_counts: {} });
      membersService.findOnlineChairmen.mockResolvedValue([alice, bob, charlie]);
      membersService.findOnlineSpeakers.mockResolvedValue([alice, bob, charlie]);
      // First call: last 2 sessions for chairman exclusion
      // Second call: sessions in date window for speaker exclusion
      repo.find
        .mockResolvedValueOnce([
          { main_chairman_id: 'alice' },
          { main_chairman_id: 'bob' },
        ])
        .mockResolvedValueOnce([]);
      const result = await service.suggest('2026-04-15');
      expect(result.main_chairman?.id).toBe('charlie');
    });

    it('should exclude project_level 10 members from speaker suggestions', async () => {
      const alice = makeMember({ id: 'alice', name: 'Alice', project_level: 10 });
      const bob = makeMember({ id: 'bob', name: 'Bob', project_level: 3 });
      const charlie = makeMember({ id: 'charlie', name: 'Charlie', project_level: 5 });
      const diana = makeMember({ id: 'diana', name: 'Diana', project_level: 2 });
      membersService.findOnlineChairmen.mockResolvedValue([alice, bob, charlie, diana]);
      membersService.findOnlineSpeakers.mockResolvedValue([alice, bob, charlie, diana]);
      repo.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const result = await service.suggest('2026-04-15');
      const speakerIds = [result.speaker1?.id, result.speaker2?.id];
      expect(speakerIds).not.toContain('alice');
      // bob, charlie, or diana should be among speakers
      expect(speakerIds.some((id) => ['bob', 'charlie', 'diana'].includes(id ?? ''))).toBe(true);
    });

    it('should fall back to ignoring 14-day window when speaker pool is exhausted', async () => {
      const alice = makeMember({ id: 'alice', name: 'Alice', project_level: 3, role_counts: { speaker: 1 } });
      const bob = makeMember({ id: 'bob', name: 'Bob', project_level: 4, role_counts: { speaker: 2 } });
      membersService.findOnlineChairmen.mockResolvedValue([]);
      membersService.findOnlineSpeakers.mockResolvedValue([alice, bob]);
      // All speakers were recent — window sessions cover alice and bob
      repo.find
        .mockResolvedValueOnce([]) // last 2 sessions (chairman exclusion)
        .mockResolvedValueOnce([
          { speaker1_id: 'alice', speaker2_id: 'bob' },
        ]); // window sessions (speaker exclusion)
      const result = await service.suggest('2026-04-15');
      // fallback should still suggest both speakers
      expect(result.speaker1).not.toBeNull();
      expect(result.speaker2).not.toBeNull();
      expect([result.speaker1?.id, result.speaker2?.id].sort()).toEqual(['alice', 'bob']);
    });

    it('should not assign the same person as both chairman and speaker', async () => {
      const alice = makeMember({ id: 'alice', name: 'Alice', project_level: 3 });
      const bob = makeMember({ id: 'bob', name: 'Bob', project_level: 5 });
      membersService.findOnlineChairmen.mockResolvedValue([alice, bob]);
      membersService.findOnlineSpeakers.mockResolvedValue([alice, bob]);
      repo.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const result = await service.suggest('2026-04-15');
      const allAssigned = [
        result.main_chairman?.id,
        result.sub_chairman?.id,
        result.speaker1?.id,
        result.speaker2?.id,
      ].filter(Boolean);
      const uniqueIds = new Set(allAssigned);
      expect(uniqueIds.size).toBe(allAssigned.length);
    });
  });
});
