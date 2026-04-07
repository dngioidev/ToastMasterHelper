import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfflineSession } from './offline-session.entity';
import { OfflineSessionAssignment } from './offline-session-assignment.entity';
import { OfflineSessionsController } from './offline-sessions.controller';
import { OfflineSessionsService } from './offline-sessions.service';
import { MembersModule } from '../members/members.module';
import { OnlineSession } from '../online-sessions/online-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfflineSession, OfflineSessionAssignment, OnlineSession]),
    MembersModule,
  ],
  controllers: [OfflineSessionsController],
  providers: [OfflineSessionsService],
  exports: [OfflineSessionsService],
})
export class OfflineSessionsModule {}
