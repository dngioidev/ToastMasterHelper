import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { ExportService } from './export.service';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { OfflineRole } from '../offline-sessions/offline-session-assignment.entity';
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

  describe('speaker project level label', () => {
    it('shows P(level+1) for speakers in offline sheet', async () => {
      const speaker = mockMember('Carol') as Member;
      speaker.project_level = 3;

      const sessionWithSpeaker: Partial<OfflineSession> = {
        id: 'sess-1',
        date: '2026-01-22',
        num_speakers: 1,
        num_backup_speakers: 0,
        is_cancelled: false,
        notes: null,
        assignments: [
          { id: 'a1', role: OfflineRole.SPEAKER, slot_index: 0, member: speaker } as any,
        ],
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ExportService,
          { provide: getRepositoryToken(OnlineSession), useValue: makeRepo([]) },
          { provide: getRepositoryToken(OfflineSession), useValue: makeRepo([sessionWithSpeaker]) },
          { provide: getRepositoryToken(Member), useValue: makeRepo([speaker]) },
        ],
      }).compile();

      const svc = module.get<ExportService>(ExportService);
      const buf = await svc.exportSessions('2026-01-01', '2026-01-31');

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buf as unknown as ArrayBuffer);
      const ws = wb.getWorksheet('Offline Sessions')!;

      // Row 2 = Speaker 1 (index per ROLE_DEFS: no=3)
      let found = false;
      ws.eachRow((row) => {
        row.eachCell((cell) => {
          if (typeof cell.value === 'string' && cell.value.includes('Carol')) {
            expect(cell.value).toBe('Carol (P4)');
            found = true;
          }
        });
      });
      expect(found).toBe(true);
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
