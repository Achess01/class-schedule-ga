import type { Chromosome } from '../domain/chromosome';
import type { Gene } from '../domain/gene';
import { evaluateChromosome } from '../fitness/fitness-evaluator';
import type { GaInputContext } from './ga-input';
import { mutate } from '../operators/mutation';

export function   initializePopulation(input: GaInputContext): Chromosome[] {
  const population: Chromosome[] = [];

  for (let i = 0; i < input.populationSize; i += 1) {
    const clonedGenes = cloneGenes(input.initialGenes);
    const randomizedGenes =
      i === 0
        ? clonedGenes
        : mutate(
            clonedGenes,
            1,
            input.geneOptionsByKey,
            input.slotCatalog.slotsPerDay,
          );

    const chromosome: Chromosome = {
      chromosomeId: `gen-0-${i}`,
      scheduleConfigId: input.scheduleConfigId,
      genes: randomizedGenes,
      fitness: 0,
      hardPenalty: 0,
      softPenalty: 0,
      feasibilityPenalty: 0,
      violations: [],
      metrics: {
        requiredGeneCount: randomizedGenes.length,
        assignedGeneCount: 0,
        unassignedClassroomCount: 0,
        unassignedProfessorCount: 0,
      },
      generation: 0,
      createdAt: new Date(),
    };

    population.push(evaluateChromosome(chromosome, input.slotCatalog));
  }

  return population;
}

function cloneGenes(genes: Gene[]): Gene[] {
  return genes.map((gene) => ({
    ...gene,
    careerCodes: [...gene.careerCodes],
    academicTargets: gene.academicTargets.map((target) => ({ ...target })),
  }));
}
