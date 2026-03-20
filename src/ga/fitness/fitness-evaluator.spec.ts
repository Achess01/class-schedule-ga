import { AssignmentStatus } from '../domain/assignment-status';
import type { Chromosome } from '../domain/chromosome';
import { CLASS_DAY_INDEX, LAB1_DAY_INDEX } from '../domain/day-type';
import type { Gene } from '../domain/gene';
import { SessionType } from '../domain/session-type';
import { buildSlotCatalog } from '../domain/slot-catalog';
import { ViolationCode } from '../domain/violation-code';
import { evaluateChromosome } from './fitness-evaluator';

function createCatalog() {
  return buildSlotCatalog({
    periodDurationM: 50,
    morningStartTime: new Date('2026-03-15T07:00:00.000Z'),
    morningEndTime: new Date('2026-03-15T12:00:00.000Z'),
    afternoonStartTime: new Date('2026-03-15T13:00:00.000Z'),
    afternoonEndTime: new Date('2026-03-15T17:10:00.000Z'),
  });
}

function createGene(overrides: Partial<Gene> = {}): Gene {
  return {
    geneId: 'g-1',
    scheduleConfigId: 1n,
    configCourseId: 10n,
    courseCode: 1201,
    academicTargets: [{ careerCode: 1, semester: 4, isMandatory: true }],
    careerCodes: [1],
    semester: 4,
    isMandatory: true,
    isCommonArea: false,
    sectionIndex: 1,
    sessionType: SessionType.CLASS,
    dayIndex: CLASS_DAY_INDEX,
    startSlot: 0,
    periodCount: 1,
    requireClassroom: true,
    configClassroomId: 100n,
    configProfessorId: 200n,
    professorEntryMinute: 420,
    professorExitMinute: 1080,
    fixedDayIndex: undefined,
    fixedStartSlot: undefined,
    assignmentStatus: AssignmentStatus.ASSIGNED,
    isFixed: false,
    ...overrides,
  };
}

function createChromosome(genes: Gene[]): Chromosome {
  return {
    chromosomeId: 'c-1',
    scheduleConfigId: 1n,
    genes,
    fitness: 0,
    hardPenalty: 0,
    softPenalty: 0,
    feasibilityPenalty: 0,
    violations: [],
    metrics: {
      requiredGeneCount: 0,
      assignedGeneCount: 0,
      unassignedClassroomCount: 0,
      unassignedProfessorCount: 0,
    },
    generation: 0,
    createdAt: new Date('2026-03-15T00:00:00.000Z'),
  };
}

describe('evaluateChromosome', () => {
  it('penalizes mandatory collisions in same career and semester', () => {
    const catalog = createCatalog();
    const gene1 = createGene({
      geneId: 'g-1',
      courseCode: 1201,
      careerCodes: [1],
    });
    const gene2 = createGene({
      geneId: 'g-2',
      configCourseId: 11n,
      courseCode: 1301,
      careerCodes: [1],
      configProfessorId: 201n,
      configClassroomId: 101n,
    });

    const result = evaluateChromosome(
      createChromosome([gene1, gene2]),
      catalog,
    );

    expect(result.violations).toContain(
      ViolationCode.MANDATORY_ACADEMIC_COLLISION,
    );
    expect(result.hardPenalty).toBeGreaterThan(0);
  });

  it('penalizes mandatory common-area collisions across careers', () => {
    const catalog = createCatalog();
    const gene1 = createGene({
      geneId: 'g-1',
      isCommonArea: true,
      careerCodes: [],
    });
    const gene2 = createGene({
      geneId: 'g-2',
      configCourseId: 12n,
      courseCode: 1401,
      careerCodes: [2],
      configProfessorId: 202n,
      configClassroomId: 102n,
    });

    const result = evaluateChromosome(
      createChromosome([gene1, gene2]),
      catalog,
    );

    expect(result.violations).toContain(
      ViolationCode.MANDATORY_ACADEMIC_COLLISION,
    );
    expect(result.hardPenalty).toBeGreaterThan(0);
  });

  it('does not penalize mandatory courses from different careers when not common area', () => {
    const catalog = createCatalog();
    const gene1 = createGene({ geneId: 'g-1', careerCodes: [1] });
    const gene2 = createGene({
      geneId: 'g-2',
      configCourseId: 13n,
      courseCode: 1501,
      careerCodes: [2],
      configProfessorId: 203n,
      configClassroomId: 103n,
    });

    const result = evaluateChromosome(
      createChromosome([gene1, gene2]),
      catalog,
    );

    expect(result.violations).not.toContain(
      ViolationCode.MANDATORY_ACADEMIC_COLLISION,
    );
  });

  it('penalizes unassigned classroom and invalid class block on lab day', () => {
    const catalog = createCatalog();
    const gene = createGene({
      dayIndex: LAB1_DAY_INDEX,
      sessionType: SessionType.CLASS,
      periodCount: 2,
      assignmentStatus: AssignmentStatus.UNASSIGNED_CLASSROOM,
      configClassroomId: undefined,
    });

    const result = evaluateChromosome(createChromosome([gene]), catalog);

    expect(result.violations).toContain(
      ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK,
    );
    expect(result.violations).toContain(ViolationCode.UNASSIGNED_CLASSROOM);
    expect(result.metrics.unassignedClassroomCount).toBe(1);
    expect(result.feasibilityPenalty).toBeGreaterThan(0);
  });

  it('penalizes invalid fixed assignment', () => {
    const catalog = createCatalog();
    const gene = createGene({
      isFixed: true,
      fixedDayIndex: CLASS_DAY_INDEX,
      fixedStartSlot: 3,
      dayIndex: CLASS_DAY_INDEX,
      startSlot: 2,
    });

    const result = evaluateChromosome(createChromosome([gene]), catalog);

    expect(result.violations).toContain(ViolationCode.INVALID_FIXED_ASSIGNMENT);
  });

  it('penalizes professor unavailability', () => {
    const catalog = createCatalog();
    const gene = createGene({
      startSlot: 0,
      periodCount: 1,
      professorEntryMinute: 500,
      professorExitMinute: 1080,
    });

    const result = evaluateChromosome(createChromosome([gene]), catalog);

    expect(result.violations).toContain(ViolationCode.PROFESSOR_UNAVAILABLE);
  });
});
