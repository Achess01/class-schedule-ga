import { AssignmentStatus } from '../domain/assignment-status';
import type { Chromosome } from '../domain/chromosome';
import { LAB1_DAY_INDEX, LAB2_DAY_INDEX } from '../domain/day-type';
import type { Gene } from '../domain/gene';
import { SessionType } from '../domain/session-type';
import {
  canFitContiguousBlock,
  type SlotCatalog,
} from '../domain/slot-catalog';
import { ViolationCode } from '../domain/violation-code';
import type { ViolationDetail } from '../domain/violation-detail';

export interface FitnessWeights {
  hard: number;
  feasibility: number;
  soft: number;
}

export const DEFAULT_FITNESS_WEIGHTS: FitnessWeights = {
  hard: 1000,
  feasibility: 300,
  soft: 25,
};

export function evaluateChromosome(
  chromosome: Chromosome,
  slotCatalog: SlotCatalog,
  weights: FitnessWeights = DEFAULT_FITNESS_WEIGHTS,
): Chromosome {
  let hardPenalty = 0;
  let feasibilityPenalty = 0;
  let softPenalty = 0;

  let assignedGeneCount = 0;
  let unassignedClassroomCount = 0;
  let unassignedProfessorCount = 0;

  const violations = new Set<ViolationCode>();
  const violationDetails: ViolationDetail[] = [];

  const professorOccupancy = new Map<string, bigint[]>();
  const classroomOccupancy = new Map<string, bigint[]>();
  const sectionOccupancy = new Map<string, string[]>();
  const mandatoryAcademicBySlot = new Map<string, Gene[]>();

  for (const gene of chromosome.genes) {
    if (
      !canFitContiguousBlock(
        slotCatalog.slotsPerDay,
        gene.startSlot,
        gene.periodCount,
      )
    ) {
      hardPenalty += weights.hard;
      if (gene.sessionType === SessionType.LAB) {
        violations.add(ViolationCode.INVALID_LAB_BLOCK);
        addViolationDetail(violationDetails, {
          code: ViolationCode.INVALID_LAB_BLOCK,
          dayIndex: gene.dayIndex,
          geneIds: [gene.geneId],
          configCourseIds: [gene.configCourseId],
          courseCodes: [gene.courseCode],
          sectionIndexes: [gene.sectionIndex],
          configProfessorIds: withDefinedBigInt(gene.configProfessorId),
          configClassroomIds: withDefinedBigInt(gene.configClassroomId),
        });
      } else if (isLabDay(gene.dayIndex)) {
        violations.add(ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK);
        addViolationDetail(violationDetails, {
          code: ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK,
          dayIndex: gene.dayIndex,
          geneIds: [gene.geneId],
          configCourseIds: [gene.configCourseId],
          courseCodes: [gene.courseCode],
          sectionIndexes: [gene.sectionIndex],
          configProfessorIds: withDefinedBigInt(gene.configProfessorId),
          configClassroomIds: withDefinedBigInt(gene.configClassroomId),
        });
      }
      continue;
    }

    if (gene.sessionType === SessionType.LAB && gene.periodCount !== 3) {
      hardPenalty += weights.hard;
      violations.add(ViolationCode.INVALID_LAB_BLOCK);
      addViolationDetail(violationDetails, {
        code: ViolationCode.INVALID_LAB_BLOCK,
        dayIndex: gene.dayIndex,
        geneIds: [gene.geneId],
        configCourseIds: [gene.configCourseId],
        courseCodes: [gene.courseCode],
        sectionIndexes: [gene.sectionIndex],
        configProfessorIds: withDefinedBigInt(gene.configProfessorId),
        configClassroomIds: withDefinedBigInt(gene.configClassroomId),
      });
    }

    if (
      gene.sessionType === SessionType.CLASS &&
      isLabDay(gene.dayIndex) &&
      gene.periodCount !== 3
    ) {
      hardPenalty += weights.hard;
      violations.add(ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK);
      addViolationDetail(violationDetails, {
        code: ViolationCode.INVALID_CLASS_LAB_DAY_BLOCK,
        dayIndex: gene.dayIndex,
        geneIds: [gene.geneId],
        configCourseIds: [gene.configCourseId],
        courseCodes: [gene.courseCode],
        sectionIndexes: [gene.sectionIndex],
        configProfessorIds: withDefinedBigInt(gene.configProfessorId),
        configClassroomIds: withDefinedBigInt(gene.configClassroomId),
      });
    }

    if (
      gene.isFixed &&
      (gene.fixedDayIndex === undefined ||
        gene.fixedStartSlot === undefined ||
        gene.dayIndex !== gene.fixedDayIndex ||
        gene.startSlot !== gene.fixedStartSlot)
    ) {
      hardPenalty += weights.hard;
      violations.add(ViolationCode.INVALID_FIXED_ASSIGNMENT);
      addViolationDetail(violationDetails, {
        code: ViolationCode.INVALID_FIXED_ASSIGNMENT,
        dayIndex: gene.dayIndex,
        slotIndex: gene.startSlot,
        geneIds: [gene.geneId],
        configCourseIds: [gene.configCourseId],
        courseCodes: [gene.courseCode],
        sectionIndexes: [gene.sectionIndex],
        configProfessorIds: withDefinedBigInt(gene.configProfessorId),
        configClassroomIds: withDefinedBigInt(gene.configClassroomId),
      });
    }

    if (gene.assignmentStatus === AssignmentStatus.ASSIGNED) {
      assignedGeneCount += 1;
    }

    if (
      gene.assignmentStatus === AssignmentStatus.UNASSIGNED_CLASSROOM ||
      gene.assignmentStatus === AssignmentStatus.UNASSIGNED_BOTH
    ) {
      feasibilityPenalty += weights.feasibility;
      unassignedClassroomCount += 1;
      violations.add(ViolationCode.UNASSIGNED_CLASSROOM);
      addViolationDetail(violationDetails, {
        code: ViolationCode.UNASSIGNED_CLASSROOM,
        dayIndex: gene.dayIndex,
        slotIndex: gene.startSlot,
        geneIds: [gene.geneId],
        configCourseIds: [gene.configCourseId],
        courseCodes: [gene.courseCode],
        sectionIndexes: [gene.sectionIndex],
        configProfessorIds: withDefinedBigInt(gene.configProfessorId),
        configClassroomIds: [],
      });
    }

    if (
      gene.assignmentStatus === AssignmentStatus.UNASSIGNED_PROFESSOR ||
      gene.assignmentStatus === AssignmentStatus.UNASSIGNED_BOTH
    ) {
      feasibilityPenalty += weights.feasibility;
      unassignedProfessorCount += 1;
      violations.add(ViolationCode.UNASSIGNED_PROFESSOR);
      addViolationDetail(violationDetails, {
        code: ViolationCode.UNASSIGNED_PROFESSOR,
        dayIndex: gene.dayIndex,
        slotIndex: gene.startSlot,
        geneIds: [gene.geneId],
        configCourseIds: [gene.configCourseId],
        courseCodes: [gene.courseCode],
        sectionIndexes: [gene.sectionIndex],
        configProfessorIds: [],
        configClassroomIds: withDefinedBigInt(gene.configClassroomId),
      });
    }

    if (gene.sessionType === SessionType.CLASS && isLabDay(gene.dayIndex)) {
      softPenalty += weights.soft;
    }

    const occupiedSlots = buildOccupiedSlots(gene.startSlot, gene.periodCount);
    for (const slotIndex of occupiedSlots) {
      const slotKey = `${gene.dayIndex}:${slotIndex}`;
      const slot = slotCatalog.byDay[gene.dayIndex][slotIndex];
      if (
        slot &&
        gene.professorEntryMinute !== undefined &&
        gene.professorExitMinute !== undefined &&
        (slot.startMinuteOfDay < gene.professorEntryMinute ||
          slot.endMinuteOfDay > gene.professorExitMinute)
      ) {
        hardPenalty += weights.hard;
        violations.add(ViolationCode.PROFESSOR_UNAVAILABLE);
        addViolationDetail(violationDetails, {
          code: ViolationCode.PROFESSOR_UNAVAILABLE,
          dayIndex: gene.dayIndex,
          slotIndex,
          geneIds: [gene.geneId],
          configCourseIds: [gene.configCourseId],
          courseCodes: [gene.courseCode],
          sectionIndexes: [gene.sectionIndex],
          configProfessorIds: withDefinedBigInt(gene.configProfessorId),
          configClassroomIds: withDefinedBigInt(gene.configClassroomId),
        });
      }

      const sectionKey = `${gene.configCourseId.toString()}:${gene.sectionIndex}`;
      const sectionValues = sectionOccupancy.get(slotKey) ?? [];
      if (sectionValues.includes(sectionKey)) {
        hardPenalty += weights.hard;
        violations.add(ViolationCode.SECTION_COLLISION);
        addViolationDetail(violationDetails, {
          code: ViolationCode.SECTION_COLLISION,
          dayIndex: gene.dayIndex,
          slotIndex,
          geneIds: [gene.geneId],
          configCourseIds: [gene.configCourseId],
          courseCodes: [gene.courseCode],
          sectionIndexes: [gene.sectionIndex],
          configProfessorIds: withDefinedBigInt(gene.configProfessorId),
          configClassroomIds: withDefinedBigInt(gene.configClassroomId),
        });
      }
      sectionValues.push(sectionKey);
      sectionOccupancy.set(slotKey, sectionValues);

      if (gene.configProfessorId !== undefined) {
        const profValues = professorOccupancy.get(slotKey) ?? [];
        if (profValues.includes(gene.configProfessorId)) {
          hardPenalty += weights.hard;
          violations.add(ViolationCode.PROFESSOR_COLLISION);
          addViolationDetail(violationDetails, {
            code: ViolationCode.PROFESSOR_COLLISION,
            dayIndex: gene.dayIndex,
            slotIndex,
            geneIds: [gene.geneId],
            configCourseIds: [gene.configCourseId],
            courseCodes: [gene.courseCode],
            sectionIndexes: [gene.sectionIndex],
            configProfessorIds: [gene.configProfessorId],
            configClassroomIds: withDefinedBigInt(gene.configClassroomId),
          });
        }
        profValues.push(gene.configProfessorId);
        professorOccupancy.set(slotKey, profValues);
      }

      if (gene.configClassroomId !== undefined) {
        const classroomValues = classroomOccupancy.get(slotKey) ?? [];
        if (classroomValues.includes(gene.configClassroomId)) {
          hardPenalty += weights.hard;
          violations.add(ViolationCode.CLASSROOM_COLLISION);
          addViolationDetail(violationDetails, {
            code: ViolationCode.CLASSROOM_COLLISION,
            dayIndex: gene.dayIndex,
            slotIndex,
            geneIds: [gene.geneId],
            configCourseIds: [gene.configCourseId],
            courseCodes: [gene.courseCode],
            sectionIndexes: [gene.sectionIndex],
            configProfessorIds: withDefinedBigInt(gene.configProfessorId),
            configClassroomIds: [gene.configClassroomId],
          });
        }
        classroomValues.push(gene.configClassroomId);
        classroomOccupancy.set(slotKey, classroomValues);
      }

      if (gene.isMandatory) {
        const mandatoryValues = mandatoryAcademicBySlot.get(slotKey) ?? [];
        mandatoryValues.push(gene);
        mandatoryAcademicBySlot.set(slotKey, mandatoryValues);
      }
    }
  }

  for (const genesAtSlot of mandatoryAcademicBySlot.values()) {
    for (let i = 0; i < genesAtSlot.length; i += 1) {
      for (let j = i + 1; j < genesAtSlot.length; j += 1) {
        if (hasMandatoryAcademicCollision(genesAtSlot[i], genesAtSlot[j])) {
          hardPenalty += weights.hard;
          violations.add(ViolationCode.MANDATORY_ACADEMIC_COLLISION);
          addViolationDetail(violationDetails, {
            code: ViolationCode.MANDATORY_ACADEMIC_COLLISION,
            dayIndex: genesAtSlot[i].dayIndex,
            geneIds: [genesAtSlot[i].geneId, genesAtSlot[j].geneId],
            configCourseIds: [
              genesAtSlot[i].configCourseId,
              genesAtSlot[j].configCourseId,
            ],
            courseCodes: [genesAtSlot[i].courseCode, genesAtSlot[j].courseCode],
            sectionIndexes: [
              genesAtSlot[i].sectionIndex,
              genesAtSlot[j].sectionIndex,
            ],
            configProfessorIds: dedupeBigInt([
              ...withDefinedBigInt(genesAtSlot[i].configProfessorId),
              ...withDefinedBigInt(genesAtSlot[j].configProfessorId),
            ]),
            configClassroomIds: dedupeBigInt([
              ...withDefinedBigInt(genesAtSlot[i].configClassroomId),
              ...withDefinedBigInt(genesAtSlot[j].configClassroomId),
            ]),
          });
        }
      }
    }
  }

  const totalPenalty = hardPenalty + feasibilityPenalty + softPenalty;
  const fitness = 1 / (1 + totalPenalty);

  return {
    ...chromosome,
    fitness,
    hardPenalty,
    feasibilityPenalty,
    softPenalty,
    violations: [...violations],
    violationDetails,
    metrics: {
      requiredGeneCount: chromosome.genes.length,
      assignedGeneCount,
      unassignedClassroomCount,
      unassignedProfessorCount,
    },
  };
}

function addViolationDetail(
  target: ViolationDetail[],
  detail: ViolationDetail,
): void {
  target.push({
    ...detail,
    geneIds: [...new Set(detail.geneIds)],
    configCourseIds: dedupeBigInt(detail.configCourseIds),
    courseCodes: [...new Set(detail.courseCodes)],
    sectionIndexes: [...new Set(detail.sectionIndexes)] as Array<1 | 2>,
    configProfessorIds: dedupeBigInt(detail.configProfessorIds),
    configClassroomIds: dedupeBigInt(detail.configClassroomIds),
  });
}

function withDefinedBigInt(value?: bigint): bigint[] {
  return value === undefined ? [] : [value];
}

function dedupeBigInt(values: bigint[]): bigint[] {
  return [...new Set(values.map((value) => value.toString()))].map((value) =>
    BigInt(value),
  );
}

function isLabDay(dayIndex: number): boolean {
  return dayIndex === LAB1_DAY_INDEX || dayIndex === LAB2_DAY_INDEX;
}

function buildOccupiedSlots(startSlot: number, periodCount: number): number[] {
  const slots: number[] = [];
  for (let offset = 0; offset < periodCount; offset += 1) {
    slots.push(startSlot + offset);
  }
  return slots;
}

function hasMandatoryAcademicCollision(left: Gene, right: Gene): boolean {
  if (!left.isMandatory || !right.isMandatory) {
    return false;
  }

  if (left.semester !== right.semester) {
    return false;
  }

  if (left.isCommonArea || right.isCommonArea) {
    return true;
  }

  return hasSharedCareer(left.careerCodes, right.careerCodes);
}

function hasSharedCareer(left: number[], right: number[]): boolean {
  if (left.length === 0 || right.length === 0) {
    return false;
  }
  const careerSet = new Set(left);
  return right.some((careerCode) => careerSet.has(careerCode));
}
