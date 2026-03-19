import type { Chromosome } from '../domain/chromosome';
import type { Gene } from '../domain/gene';

export function crossover(
  parentA: Chromosome,
  parentB: Chromosome,
  crossMethod: number,
): [Gene[], Gene[]] {
  return crossMethod === 2
    ? uniformCrossover(parentA.genes, parentB.genes)
    : onePointCrossover(parentA.genes, parentB.genes);
}

function onePointCrossover(genesA: Gene[], genesB: Gene[]): [Gene[], Gene[]] {
  const length = Math.min(genesA.length, genesB.length);
  if (length < 2) {
    return [cloneGenes(genesA), cloneGenes(genesB)];
  }

  const point = randomInRange(1, length - 1);
  const childA: Gene[] = [];
  const childB: Gene[] = [];

  for (let i = 0; i < length; i += 1) {
    const geneA = genesA[i];
    const geneB = genesB[i];
    if (geneA.isFixed || geneB.isFixed) {
      childA.push(cloneGene(geneA));
      childB.push(cloneGene(geneB));
      continue;
    }
    if (i < point) {
      childA.push(cloneGene(geneA));
      childB.push(cloneGene(geneB));
    } else {
      childA.push(cloneGene(geneB));
      childB.push(cloneGene(geneA));
    }
  }

  return [childA, childB];
}

function uniformCrossover(genesA: Gene[], genesB: Gene[]): [Gene[], Gene[]] {
  const length = Math.min(genesA.length, genesB.length);
  const childA: Gene[] = [];
  const childB: Gene[] = [];

  for (let i = 0; i < length; i += 1) {
    const geneA = genesA[i];
    const geneB = genesB[i];
    if (geneA.isFixed || geneB.isFixed) {
      childA.push(cloneGene(geneA));
      childB.push(cloneGene(geneB));
      continue;
    }

    const useAFirst = Math.random() < 0.5;
    childA.push(cloneGene(useAFirst ? geneA : geneB));
    childB.push(cloneGene(useAFirst ? geneB : geneA));
  }

  return [childA, childB];
}

function cloneGenes(genes: Gene[]): Gene[] {
  return genes.map((gene) => cloneGene(gene));
}

function cloneGene(gene: Gene): Gene {
  return {
    ...gene,
    careerCodes: [...gene.careerCodes],
    academicTargets: gene.academicTargets.map((target) => ({ ...target })),
  };
}

function randomInRange(minInclusive: number, maxInclusive: number): number {
  return (
    Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive
  );
}
