import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { Member } from '../members/member.entity';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { OfflineSessionAssignment } from '../offline-sessions/offline-session-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      OnlineSession,
      OfflineSession,
      OfflineSessionAssignment,
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
