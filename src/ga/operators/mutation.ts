import { AssignmentStatus } from '../domain/assignment-status';
import {
  CLASS_DAY_INDEX,
  type DayIndex,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
} from '../domain/day-type';
import type { Gene } from '../domain/gene';
import { SessionType } from '../domain/session-type';
import type { GeneAssignmentOptions } from '../pipeline/ga-input';

export function mutate(
  genes: Gene[],
  mutationMethod: number,
  geneOptionsByKey: Map<string, GeneAssignmentOptions>,
  slotsPerDay: number,
): Gene[] {
  const cloned = cloneGenes(genes);
  if (cloned.length === 0) {
    return cloned;
  }

  if (mutationMethod === 2) {
    return swapMutation(cloned, geneOptionsByKey, slotsPerDay);
  }
  return reassignMutation(cloned, geneOptionsByKey, slotsPerDay);
}

function reassignMutation(
  genes: Gene[],
  geneOptionsByKey: Map<string, GeneAssignmentOptions>,
  slotsPerDay: number,
): Gene[] {
  const mutableIndexes = genes
    .map((gene, index) => ({ gene, index }))
    .filter(({ gene }) => !gene.isFixed)
    .map(({ index }) => index);

  if (mutableIndexes.length === 0) {
    return genes;
  }

  const targetIndex = mutableIndexes[randomIndex(mutableIndexes.length)];
  const target = genes[targetIndex];
  const options = geneOptionsByKey.get(getOptionKey(target));
  if (!options) {
    return genes;
  }

  target.dayIndex = randomDayForSession(target.sessionType);

  const expectedPeriodCount =
    target.sessionType === SessionType.LAB || isLabDay(target.dayIndex)
      ? 3
      : options.classPeriodCount;
  target.periodCount = Math.max(1, Math.min(expectedPeriodCount, slotsPerDay));

  target.startSlot = randomStartSlot(slotsPerDay, target.periodCount);

  target.configProfessorId = pickRandom(options.professorCandidates);
  target.configClassroomId = target.requireClassroom
    ? pickRandom(options.classroomCandidates)
    : undefined;

  target.assignmentStatus = computeStatus(
    target.requireClassroom,
    target.configProfessorId,
    target.configClassroomId,
  );

  return genes;
}

function swapMutation(
  genes: Gene[],
  geneOptionsByKey: Map<string, GeneAssignmentOptions>,
  slotsPerDay: number,
): Gene[] {
  const mutableIndexes = genes
    .map((gene, index) => ({ gene, index }))
    .filter(({ gene }) => !gene.isFixed)
    .map(({ index }) => index);

  if (mutableIndexes.length < 2) {
    return genes;
  }

  const first = mutableIndexes[randomIndex(mutableIndexes.length)];
  let second = mutableIndexes[randomIndex(mutableIndexes.length)];
  while (second === first) {
    second = mutableIndexes[randomIndex(mutableIndexes.length)];
  }

  const geneA = genes[first];
  const geneB = genes[second];

  const [dayIndex, startSlot] = [geneA.dayIndex, geneA.startSlot];
  geneA.dayIndex = geneB.dayIndex;
  geneA.startSlot = geneB.startSlot;
  geneB.dayIndex = dayIndex;
  geneB.startSlot = startSlot;

  normalizeGene(geneA, geneOptionsByKey.get(getOptionKey(geneA)), slotsPerDay);
  normalizeGene(geneB, geneOptionsByKey.get(getOptionKey(geneB)), slotsPerDay);

  return genes;
}

function normalizeGene(
  gene: Gene,
  options: GeneAssignmentOptions | undefined,
  slotsPerDay: number,
): void {
  if (!options) {
    return;
  }

  const expectedPeriodCount =
    gene.sessionType === SessionType.LAB || isLabDay(gene.dayIndex)
      ? 3
      : options.classPeriodCount;
  gene.periodCount = Math.max(1, Math.min(expectedPeriodCount, slotsPerDay));
  if (gene.startSlot + gene.periodCount > slotsPerDay) {
    gene.startSlot = Math.max(0, slotsPerDay - gene.periodCount);
  }
  if (gene.requireClassroom && gene.configClassroomId === undefined) {
    gene.configClassroomId = pickRandom(options.classroomCandidates);
  }
  if (gene.configProfessorId === undefined) {
    gene.configProfessorId = pickRandom(options.professorCandidates);
  }
  gene.assignmentStatus = computeStatus(
    gene.requireClassroom,
    gene.configProfessorId,
    gene.configClassroomId,
  );
}

function randomDayForSession(sessionType: SessionType): DayIndex {
  if (sessionType === SessionType.LAB) {
    return Math.random() < 0.5 ? LAB1_DAY_INDEX : LAB2_DAY_INDEX;
  }

  const roll = Math.random();
  if (roll < 0.7) {
    return CLASS_DAY_INDEX;
  }
  return roll < 0.85 ? LAB1_DAY_INDEX : LAB2_DAY_INDEX;
}

function randomStartSlot(slotsPerDay: number, periodCount: number): number {
  const maxStart = Math.max(0, slotsPerDay - periodCount);
  return Math.floor(Math.random() * (maxStart + 1));
}

function pickRandom<T>(values: T[]): T | undefined {
  if (values.length === 0) {
    return undefined;
  }
  return values[randomIndex(values.length)];
}

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

function computeStatus(
  requireClassroom: boolean,
  configProfessorId?: bigint,
  configClassroomId?: bigint,
): AssignmentStatus {
  const hasProfessor = configProfessorId !== undefined;
  const hasClassroom = !requireClassroom || configClassroomId !== undefined;

  if (hasProfessor && hasClassroom) {
    return AssignmentStatus.ASSIGNED;
  }
  if (!hasProfessor && !hasClassroom && requireClassroom) {
    return AssignmentStatus.UNASSIGNED_BOTH;
  }
  if (!hasProfessor) {
    return AssignmentStatus.UNASSIGNED_PROFESSOR;
  }
  return AssignmentStatus.UNASSIGNED_CLASSROOM;
}

function isLabDay(dayIndex: DayIndex): boolean {
  return dayIndex === LAB1_DAY_INDEX || dayIndex === LAB2_DAY_INDEX;
}

function cloneGenes(genes: Gene[]): Gene[] {
  return genes.map((gene) => ({
    ...gene,
    careerCodes: [...gene.careerCodes],
    academicTargets: gene.academicTargets.map((target) => ({ ...target })),
  }));
}

function getOptionKey(
  gene: Pick<Gene, 'configCourseId' | 'sectionIndex' | 'sessionType'>,
): string {
  return `${gene.configCourseId.toString()}:${gene.sectionIndex}:${gene.sessionType}`;
}
