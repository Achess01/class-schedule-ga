import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GeneratedScheduleController } from './generated-schedule.controller';
import { GeneratedScheduleService } from './generated-schedule.service';

@Module({
  imports: [PrismaModule],
  controllers: [GeneratedScheduleController],
  providers: [GeneratedScheduleService],
  exports: [GeneratedScheduleService],
})
export class GeneratedScheduleModule {}
