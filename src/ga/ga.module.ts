import { Module } from '@nestjs/common';
import { GaService } from './ga.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GaController } from './ga.controller';
import { GeneratedScheduleService } from '../module/generated-schedule/generated-schedule.service';

@Module({
  imports: [PrismaModule],
  controllers: [GaController],
  providers: [GaService, GeneratedScheduleService],
  exports: [GaService],
})
export class GaModule {}
