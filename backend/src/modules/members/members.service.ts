import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberStatus } from './member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

export interface PaginatedMembers {
  data: Member[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async findAll(page = 1, limit = 50): Promise<PaginatedMembers> {
    const [data, total] = await this.memberRepository.findAndCount({
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException(`Member ${id} not found`);
    }
    return member;
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    const member = this.memberRepository.create({
      ...dto,
      role_counts: {},
    });
    return this.memberRepository.save(member);
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    const safeDto = { ...dto };
    if (safeDto.project_level !== undefined && safeDto.project_level > 10) {
      safeDto.project_level = 10;
    }
    Object.assign(member, safeDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
  }

  async findActiveMembers(): Promise<Member[]> {
    return this.memberRepository.find({
      where: { status: MemberStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  async findEligibleSpeakers(): Promise<Member[]> {
    return this.memberRepository
      .createQueryBuilder('m')
      .where('m.status = :status', { status: MemberStatus.ACTIVE })
      .andWhere('m.project_level < 10')
      .orderBy('m.name', 'ASC')
      .getMany();
  }

  async incrementRoleCount(id: string, role: string): Promise<void> {
    const member = await this.findOne(id);
    const counts = member.role_counts ?? {};
    counts[role] = (counts[role] ?? 0) + 1;
    await this.memberRepository.update(id, { role_counts: counts });
  }

  async incrementProjectLevel(id: string): Promise<Member> {
    const member = await this.findOne(id);
    if (member.project_level < 10) {
      member.project_level = member.project_level + 1;
      return this.memberRepository.save(member);
    }
    return member;
  }
}
