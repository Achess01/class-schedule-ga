import { Module } from '@nestjs/common';
import { GaService } from './ga.service';

@Module({
  providers: [GaService],
})
export class GaModule {}
