import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { Member, MemberStatus } from '../members/member.entity';

const makeRepo = (data: unknown[] = []) => ({
  find: jest.fn().mockResolvedValue(data),
});

const mockMember = (name: string): Partial<Member> => ({
  id: '1',
  name,
  status: MemberStatus.ACTIVE,
  project_level: 3,
  role_counts: { main_chairman: 2, speaker: 1 },
  online_as_chairman: true,
  online_as_speaker: true,
  attends_offline: true,
});

const mockOnlineSession = (): Partial<OnlineSession> => ({
  id: '1',
  date: '2026-01-15',
  main_chairman: mockMember('Alice') as Member,
  sub_chairman: mockMember('Bob') as Member,
  speaker1: mockMember('Carol') as Member,
  speaker2: null,
  notes: null,
});

const mockOfflineSession = (): Partial<OfflineSession> => ({
  id: '1',
  date: '2026-01-22',
  num_speakers: 2,
  num_backup_speakers: 1,
  is_cancelled: false,
  notes: null,
  assignments: [],
});

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: getRepositoryToken(OnlineSession),
          useValue: makeRepo([mockOnlineSession()]),
        },
        {
          provide: getRepositoryToken(OfflineSession),
          useValue: makeRepo([mockOfflineSession()]),
        },
        {
          provide: getRepositoryToken(Member),
          useValue: makeRepo([mockMember('Alice')]),
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportSessions', () => {
    it('returns a non-empty Buffer', async () => {
      const buf = await service.exportSessions('2026-01-01', '2026-01-31');
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.byteLength).toBeGreaterThan(0);
    });
  });

  describe('exportFull', () => {
    it('returns a non-empty Buffer', async () => {
      const buf = await service.exportFull();
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.byteLength).toBeGreaterThan(0);
    });
  });

  describe('getMemberStatusSummary', () => {
    it('counts active and leave members', () => {
      const members = [
        { status: MemberStatus.ACTIVE } as Member,
        { status: MemberStatus.ACTIVE } as Member,
        { status: MemberStatus.LEAVE } as Member,
      ];
      const result = service.getMemberStatusSummary(members);
      expect(result).toEqual({ active: 2, leave: 1 });
    });
  });
});
