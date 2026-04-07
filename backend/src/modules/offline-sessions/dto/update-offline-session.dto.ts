import { PartialType } from '@nestjs/mapped-types';
import { CreateOfflineSessionDto } from './create-offline-session.dto';

export class UpdateOfflineSessionDto extends PartialType(CreateOfflineSessionDto) {}
