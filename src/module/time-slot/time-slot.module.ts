import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TimeSlotController } from './time-slot.controller';
import { TimeSlotService } from './time-slot.service';

@Module({
  imports: [PrismaModule],
  controllers: [TimeSlotController],
  providers: [TimeSlotService],
})
export class TimeSlotModule {}
