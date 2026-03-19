import { Injectable } from '@nestjs/common';
import type { Chromosome } from './domain/chromosome';
import { runGa } from './pipeline/engine';
import { buildGaInput } from './pipeline/ga-input';
import { initializePopulation } from './pipeline/population';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GaService {
  constructor(private readonly prismaService: PrismaService) {}

  async generate(scheduleConfigId: number): Promise<Chromosome> {
    const gaInput = await buildGaInput(
      this.prismaService,
      BigInt(scheduleConfigId),
    );
    const population = initializePopulation(gaInput);
    return runGa(gaInput, population);
  }
}
