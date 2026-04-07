import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { OnlineSession } from '../online-sessions/online-session.entity';
import { OfflineSession } from '../offline-sessions/offline-session.entity';
import { Member } from '../members/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnlineSession, OfflineSession, Member])],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
