import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BackupService } from './backup.service';
import { Member, MemberStatus } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { OfflineSessionAssignment } from '../offline-sessions/offline-session-assignment.entity';
import { BadRequestException } from '@nestjs/common';

const makeRepo = (rows: unknown[] = []) => ({
  find: jest.fn().mockResolvedValue(rows),
});

const mockMember = (): Partial<Member> => ({
  id: 'uuid-member-1',
  name: 'Alice',
  status: MemberStatus.ACTIVE,
  project_level: 3,
  role_counts: {},
  online_as_chairman: true,
  online_as_speaker: true,
  attends_offline: true,
});

const mockOnline = (): Partial<OnlineSession> => ({
  id: 'uuid-online-1',
  date: '2026-01-15',
  main_chairman_id: null,
  sub_chairman_id: null,
  speaker1_id: null,
  speaker2_id: null,
  notes: null,
});

const mockOffline = (): Partial<OfflineSession> => ({
  id: 'uuid-offline-1',
  date: '2026-01-22',
  num_speakers: 2,
  num_backup_speakers: 1,
  is_cancelled: false,
  notes: null,
  assignments: [],
});

const makeQrMock = () => {
  const qr = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      delete: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    },
  };
  return qr;
};

describe('BackupService', () => {
  let service: BackupService;
  let qrMock: ReturnType<typeof makeQrMock>;

  beforeEach(async () => {
    qrMock = makeQrMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        { provide: getRepositoryToken(Member), useValue: makeRepo([mockMember()]) },
        { provide: getRepositoryToken(OnlineSession), useValue: makeRepo([mockOnline()]) },
        { provide: getRepositoryToken(OfflineSession), useValue: makeRepo([mockOffline()]) },
        { provide: getRepositoryToken(OfflineSessionAssignment), useValue: makeRepo([]) },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(qrMock) },
        },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateBackup', () => {
    it('returns a backup payload with version and data arrays', async () => {
      const backup = await service.generateBackup();
      expect(backup.version).toBe('1.0');
      expect(backup.exported_at).toBeTruthy();
      expect(Array.isArray(backup.data.members)).toBe(true);
      expect(Array.isArray(backup.data.online_sessions)).toBe(true);
      expect(Array.isArray(backup.data.offline_sessions)).toBe(true);
      expect(Array.isArray(backup.data.offline_session_assignments)).toBe(true);
    });

    it('strips relation properties from sessions', async () => {
      const backup = await service.generateBackup();
      const onlineRecord = backup.data.online_sessions[0] as Record<string, unknown>;
      expect(onlineRecord).not.toHaveProperty('main_chairman');
      expect(onlineRecord).not.toHaveProperty('sub_chairman');
    });
  });

  describe('restoreBackup', () => {
    const validPayload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      data: {
        members: [mockMember() as Record<string, unknown>],
        online_sessions: [mockOnline() as Record<string, unknown>],
        offline_sessions: [mockOffline() as Record<string, unknown>],
        offline_session_assignments: [],
      },
    };

    it('returns restored count on success', async () => {
      const result = await service.restoreBackup(validPayload);
      expect(result.restored).toBe(3); // 1 member + 1 online + 1 offline + 0 assignments
    });

    it('commits the transaction', async () => {
      await service.restoreBackup(validPayload);
      expect(qrMock.commitTransaction).toHaveBeenCalled();
    });

    it('throws BadRequestException for invalid data format', async () => {
      await expect(
        service.restoreBackup({
          version: '1.0',
          exported_at: '',
          data: { members: null as unknown as [] , online_sessions: [], offline_sessions: [], offline_session_assignments: [] },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rolls back on insert failure', async () => {
      qrMock.manager.createQueryBuilder.mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(service.restoreBackup(validPayload)).rejects.toThrow();
      expect(qrMock.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
