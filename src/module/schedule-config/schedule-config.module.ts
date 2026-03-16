import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ScheduleConfigController } from './schedule-config.controller';
import { ScheduleConfigService } from './schedule-config.service';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduleConfigController],
  providers: [ScheduleConfigService],
})
export class ScheduleConfigModule {}
