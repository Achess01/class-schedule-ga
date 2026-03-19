import type { Chromosome } from '../domain/chromosome';

export function selectParents(
  population: Chromosome[],
  selectionMethod: number,
): [Chromosome, Chromosome] {
  const first =
    selectionMethod === 2
      ? tournamentSelection(population, 3)
      : rouletteSelection(population);
  const second =
    selectionMethod === 2
      ? tournamentSelection(population, 3)
      : rouletteSelection(population);

  return [first, second];
}

function rouletteSelection(population: Chromosome[]): Chromosome {
  const totalFitness = population.reduce(
    (sum, chromosome) => sum + chromosome.fitness,
    0,
  );

  if (totalFitness <= 0) {
    return population[randomIndex(population.length)];
  }

  const threshold = Math.random() * totalFitness;
  let cumulative = 0;
  for (const chromosome of population) {
    cumulative += chromosome.fitness;
    if (cumulative >= threshold) {
      return chromosome;
    }
  }

  return population[population.length - 1];
}

function tournamentSelection(
  population: Chromosome[],
  size: number,
): Chromosome {
  let winner = population[randomIndex(population.length)];
  for (let i = 1; i < size; i += 1) {
    const candidate = population[randomIndex(population.length)];
    if (candidate.fitness > winner.fitness) {
      winner = candidate;
    }
  }
  return winner;
}

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}
