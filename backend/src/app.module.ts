import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MembersModule } from './modules/members/members.module';
import { OnlineSessionsModule } from './modules/online-sessions/online-sessions.module';
import { OfflineSessionsModule } from './modules/offline-sessions/offline-sessions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    TerminusModule,
    AuthModule,
    HealthModule,
    MembersModule,
    OnlineSessionsModule,
    OfflineSessionsModule,
    DashboardModule,
  ],
})
export class AppModule {}
