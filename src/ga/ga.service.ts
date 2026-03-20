import { Injectable } from '@nestjs/common';
import { runGa } from './pipeline/engine';
import { buildGaInput } from './pipeline/ga-input';
import { initializePopulation } from './pipeline/population';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratedScheduleService } from '../module/generated-schedule/generated-schedule.service';

@Injectable()
export class GaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly generatedScheduleService: GeneratedScheduleService,
  ) {}

  async generate(scheduleConfigId: number) {
    const gaInput = await buildGaInput(
      this.prismaService,
      BigInt(scheduleConfigId),
    );
    const population = initializePopulation(gaInput);
    const chromosome = runGa(gaInput, population);

    const generatedSchedule =
      await this.generatedScheduleService.createFromChromosome(
        BigInt(scheduleConfigId),
        chromosome,
        {
          periodDurationM: gaInput.slotCatalog.periodDurationM,
          morningStartTime: new Date(
            Date.UTC(
              1970,
              0,
              1,
              Math.floor(gaInput.slotCatalog.morningStartMinuteOfDay / 60),
              gaInput.slotCatalog.morningStartMinuteOfDay % 60,
            ),
          ),
          morningEndTime: new Date(
            Date.UTC(
              1970,
              0,
              1,
              Math.floor(gaInput.slotCatalog.morningEndMinuteOfDay / 60),
              gaInput.slotCatalog.morningEndMinuteOfDay % 60,
            ),
          ),
          afternoonStartTime: new Date(
            Date.UTC(
              1970,
              0,
              1,
              Math.floor(gaInput.slotCatalog.afternoonStartMinuteOfDay / 60),
              gaInput.slotCatalog.afternoonStartMinuteOfDay % 60,
            ),
          ),
          afternoonEndTime: new Date(
            Date.UTC(
              1970,
              0,
              1,
              Math.floor(gaInput.slotCatalog.afternoonEndMinuteOfDay / 60),
              gaInput.slotCatalog.afternoonEndMinuteOfDay % 60,
            ),
          ),
        },
      );

    const response: Record<string, unknown> = {
      generatedScheduleId: generatedSchedule.generatedScheduleId,
      scheduleConfigId: BigInt(scheduleConfigId),
      summary: {
        fitness: chromosome.fitness,
        hardPenalty: chromosome.hardPenalty,
        softPenalty: chromosome.softPenalty,
        feasibilityPenalty: chromosome.feasibilityPenalty,
        requiredGeneCount: chromosome.metrics.requiredGeneCount,
        assignedGeneCount: chromosome.metrics.assignedGeneCount,
        unassignedClassroomCount: chromosome.metrics.unassignedClassroomCount,
        unassignedProfessorCount: chromosome.metrics.unassignedProfessorCount,
      },
      items: chromosome.genes,
    };

    return response;
  }
}
