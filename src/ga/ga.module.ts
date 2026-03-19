import { Module } from '@nestjs/common';
import { GaService } from './ga.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GaController } from './ga.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GaController],
  providers: [GaService],
  exports: [GaService],
})
export class GaModule {}
