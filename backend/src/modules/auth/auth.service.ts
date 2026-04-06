import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthResponse {
  access_token: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      throw new UnauthorizedException('Auth not configured');
    }

    if (dto.username !== adminUsername) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, adminPasswordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: 'admin',
      username: dto.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      username: dto.username,
    };
  }
}
