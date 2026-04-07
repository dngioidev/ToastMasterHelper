import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member, MemberStatus } from './member.entity';

const makeRepo = () => ({
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('MembersService', () => {
  let service: MembersService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    repo = makeRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: getRepositoryToken(Member), useValue: repo },
      ],
    }).compile();
    service = module.get<MembersService>(MembersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated members', async () => {
      const members = [{ id: '1', name: 'Alice' }] as Member[];
      repo.findAndCount.mockResolvedValue([members, 1]);
      const result = await service.findAll(1, 20);
      expect(result.data).toEqual(members);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const member = { id: 'uuid-1', name: 'Alice' } as Member;
      repo.findOneBy.mockResolvedValue(member);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(member);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('no-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a member', async () => {
      const dto = { name: 'Bob' };
      const created = { ...dto, role_counts: {} } as Member;
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);
      const result = await service.create(dto);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Bob', role_counts: {} });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update and return the member', async () => {
      const member = {
        id: '1',
        name: 'Alice',
        role_counts: {},
        project_level: 3,
      } as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.save.mockResolvedValue({ ...member, name: 'Alice Updated' });
      const result = await service.update('1', { name: 'Alice Updated' });
      expect(result.name).toBe('Alice Updated');
    });

    it('should cap project_level at 10', async () => {
      const member = { id: '1', project_level: 9, role_counts: {} } as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.save.mockResolvedValue({ ...member, project_level: 10 });
      await service.update('1', { project_level: 15 });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ project_level: 10 }),
      );
    });
  });

  describe('remove', () => {
    it('should remove the member', async () => {
      const member = { id: '1' } as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.remove.mockResolvedValue(undefined);
      await service.remove('1');
      expect(repo.remove).toHaveBeenCalledWith(member);
    });

    it('should throw NotFoundException if member not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove('no-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementRoleCount', () => {
    it('should increment the role count for a member', async () => {
      const member = {
        id: '1',
        name: 'Alice',
        status: MemberStatus.ACTIVE,
        project_level: 3,
        role_counts: { speaker: 2 },
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.update.mockResolvedValue(undefined);
      await service.incrementRoleCount('1', 'speaker');
      expect(repo.update).toHaveBeenCalledWith('1', {
        role_counts: { speaker: 3 },
      });
    });

    it('should initialise count from zero if role not present', async () => {
      const member = {
        id: '1',
        name: 'Alice',
        status: MemberStatus.ACTIVE,
        project_level: 3,
        role_counts: {},
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.update.mockResolvedValue(undefined);
      await service.incrementRoleCount('1', 'timer');
      expect(repo.update).toHaveBeenCalledWith('1', {
        role_counts: { timer: 1 },
      });
    });
  });

  describe('incrementProjectLevel', () => {
    it('should increment project_level if below 10', async () => {
      const member = { id: '1', project_level: 3 } as Member;
      repo.findOneBy.mockResolvedValue(member);
      repo.save.mockResolvedValue({ ...member, project_level: 4 });
      const result = await service.incrementProjectLevel('1');
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ project_level: 4 }),
      );
      expect(result.project_level).toBe(4);
    });

    it('should NOT increment project_level if already 10', async () => {
      const member = { id: '1', project_level: 10 } as Member;
      repo.findOneBy.mockResolvedValue(member);
      const result = await service.incrementProjectLevel('1');
      expect(repo.save).not.toHaveBeenCalled();
      expect(result.project_level).toBe(10);
    });
  });

  describe('findEligibleSpeakers', () => {
    it('should filter active members below level 10', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      await service.findEligibleSpeakers();
      expect(qb.andWhere).toHaveBeenCalledWith(
        'm.project_level < 10',
      );
    });
  });

  describe('status filtering', () => {
    it('should exclude Leave members from findActiveMembers', async () => {
      const active = [
        { id: '1', status: MemberStatus.ACTIVE },
      ] as Member[];
      repo.find.mockResolvedValue(active);
      const result = await service.findActiveMembers();
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: MemberStatus.ACTIVE },
        }),
      );
      expect(result).toEqual(active);
    });
  });
});
