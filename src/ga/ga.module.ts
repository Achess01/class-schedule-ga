import { Module } from '@nestjs/common';
import { GaService } from './ga.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GaService],
  exports: [GaService],
})
export class GaModule {}
