import type { Gene } from './gene';
import type { ViolationCode } from './violation-code';
import type { ViolationDetail } from './violation-detail';

export interface ChromosomeMetrics {
  requiredGeneCount: number;
  assignedGeneCount: number;
  unassignedClassroomCount: number;
  unassignedProfessorCount: number;
}

export interface Chromosome {
  chromosomeId: string;
  scheduleConfigId: bigint;
  genes: Gene[];
  fitness: number;
  hardPenalty: number;
  softPenalty: number;
  feasibilityPenalty: number;
  violations: ViolationCode[];
  violationDetails: ViolationDetail[];
  metrics: ChromosomeMetrics;
  generation: number;
  createdAt: Date;
}
