import type { Chromosome } from '../domain/chromosome';
import { evaluateChromosome } from '../fitness/fitness-evaluator';
import { crossover } from '../operators/crossover';
import { mutate } from '../operators/mutation';
import { selectParents } from '../operators/selection';
import type { GaInputContext } from './ga-input';

const ELITE_COUNT = 2;
const MUTATION_RATE = 0.25;

export function runGa(
  input: GaInputContext,
  initialPopulation: Chromosome[],
): Chromosome {
  if (initialPopulation.length === 0) {
    throw new RangeError('Initial population cannot be empty.');
  }

  let population = [...initialPopulation];

  for (let generation = 1; generation <= input.maxGeneration; generation += 1) {
    population.sort((left, right) => right.fitness - left.fitness);
    const nextPopulation: Chromosome[] = population
      .slice(0, Math.min(ELITE_COUNT, population.length))
      .map((elite, index) => ({
        ...elite,
        chromosomeId: `gen-${generation}-elite-${index}`,
        generation,
      }));

    while (nextPopulation.length < input.populationSize) {
      const [parentA, parentB] = selectParents(
        population,
        input.selectionMethod,
      );
      const [genesA, genesB] = crossover(parentA, parentB, input.crossMethod);

      const maybeMutatedA =
        Math.random() < MUTATION_RATE
          ? mutate(
              genesA,
              input.mutationMethod,
              input.geneOptionsByKey,
              input.slotCatalog.slotsPerDay,
            )
          : genesA;
      const maybeMutatedB =
        Math.random() < MUTATION_RATE
          ? mutate(
              genesB,
              input.mutationMethod,
              input.geneOptionsByKey,
              input.slotCatalog.slotsPerDay,
            )
          : genesB;

      nextPopulation.push(
        evaluateChromosome(
          createChromosome(
            input,
            maybeMutatedA,
            generation,
            `gen-${generation}-${nextPopulation.length}`,
          ),
          input.slotCatalog,
        ),
      );

      if (nextPopulation.length < input.populationSize) {
        nextPopulation.push(
          evaluateChromosome(
            createChromosome(
              input,
              maybeMutatedB,
              generation,
              `gen-${generation}-${nextPopulation.length}`,
            ),
            input.slotCatalog,
          ),
        );
      }
    }

    population = nextPopulation;
  }

  population.sort((left, right) => right.fitness - left.fitness);
  return population[0];
}

function createChromosome(
  input: GaInputContext,
  genes: Chromosome['genes'],
  generation: number,
  chromosomeId: string,
): Chromosome {
  return {
    chromosomeId,
    scheduleConfigId: input.scheduleConfigId,
    genes,
    fitness: 0,
    hardPenalty: 0,
    softPenalty: 0,
    feasibilityPenalty: 0,
    violations: [],
    violationDetails: [],
    metrics: {
      requiredGeneCount: genes.length,
      assignedGeneCount: 0,
      unassignedClassroomCount: 0,
      unassignedProfessorCount: 0,
    },
    generation,
    createdAt: new Date(),
  };
}
