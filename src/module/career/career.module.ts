import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';

@Module({
  imports: [PrismaModule],
  controllers: [CareerController],
  providers: [CareerService],
})
export class CareerModule {}
