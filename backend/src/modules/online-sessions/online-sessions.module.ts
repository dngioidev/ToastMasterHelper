import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnlineSession } from './online-session.entity';
import { OnlineSessionsController } from './online-sessions.controller';
import { OnlineSessionsService } from './online-sessions.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnlineSession]), MembersModule],
  controllers: [OnlineSessionsController],
  providers: [OnlineSessionsService],
  exports: [OnlineSessionsService],
})
export class OnlineSessionsModule {}
