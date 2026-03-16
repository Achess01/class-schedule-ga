import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigClassroomController } from './config-classroom.controller';
import { ConfigClassroomService } from './config-classroom.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigClassroomController],
  providers: [ConfigClassroomService],
})
export class ConfigClassroomModule {}
