import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = '$2b$10$hashedpassword';
    process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw UnauthorizedException for wrong username', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ username: 'wrong', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ username: 'admin', password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return access_token on valid credentials', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login({
      username: 'admin',
      password: 'correctpassword',
    });
    expect(result.access_token).toBe('mock-token');
    expect(result.username).toBe('admin');
  });

  it('should throw UnauthorizedException when ADMIN_PASSWORD_HASH not configured', async () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    await expect(
      service.login({ username: 'admin', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
