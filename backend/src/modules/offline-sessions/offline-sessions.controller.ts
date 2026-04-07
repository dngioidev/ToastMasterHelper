import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OfflineSessionsService } from './offline-sessions.service';
import { CreateOfflineSessionDto } from './dto/create-offline-session.dto';
import { UpdateOfflineSessionDto } from './dto/update-offline-session.dto';

@Controller('sessions/offline')
export class OfflineSessionsController {
  constructor(private readonly service: OfflineSessionsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('suggest')
  suggest(
    @Query('num_speakers', new ParseIntPipe({ optional: true }))
    numSpeakers?: number,
    @Query('num_backup', new ParseIntPipe({ optional: true }))
    numBackup?: number,
  ) {
    return this.service.suggest(numSpeakers, numBackup);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOfflineSessionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfflineSessionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
