import { JwtModuleOptions } from '@nestjs/jwt';

export function jwtConfig(): JwtModuleOptions {
  return {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
  };
}
