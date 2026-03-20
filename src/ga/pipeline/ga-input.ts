import { NotFoundException } from '@nestjs/common';
import { AssignmentStatus } from '../domain/assignment-status';
import {
  CLASS_DAY_INDEX,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
  type DayIndex,
  isDayIndex,
} from '../domain/day-type';
import type { AcademicTarget, Gene } from '../domain/gene';
import { SessionType } from '../domain/session-type';
import { buildSlotCatalog, type SlotCatalog } from '../domain/slot-catalog';
import type { PrismaService } from '../../prisma/prisma.service';

export interface GeneAssignmentOptions {
  classPeriodCount: number;
  requireClassroom: boolean;
  defaultClassroomId?: bigint;
  professorCandidates: bigint[];
  classroomCandidates: bigint[];
  professorAvailability: Map<
    bigint,
    { entryMinute: number; exitMinute: number }
  >;
}

export interface GaInputContext {
  scheduleConfigId: bigint;
  slotCatalog: SlotCatalog;
  classrooms: Array<{ configClassroomId: bigint; classroomName: string }>;
  selectionMethod: number;
  crossMethod: number;
  mutationMethod: number;
  maxGeneration: number;
  populationSize: number;
  initialGenes: Gene[];
  geneOptionsByKey: Map<string, GeneAssignmentOptions>;
}

export async function buildGaInput(
  prismaService: PrismaService,
  scheduleConfigId: bigint,
): Promise<GaInputContext> {
  const scheduleConfig = await prismaService.scheduleConfig.findUnique({
    where: { scheduleConfigId },
    include: {
      configCourses: {
        where: { active: true },
        include: {
          course: {
            include: {
              courseCareers: {
                where: { active: true },
              },
            },
          },
        },
      },
      configProfessors: {
        where: { active: true },
        include: {
          professor: true,
        },
      },
      configClassrooms: {
        where: { active: true },
        include: {
          classroom: true,
        },
      },
    },
  });

  if (!scheduleConfig || !scheduleConfig.active) {
    throw new NotFoundException(
      `ScheduleConfig with id ${scheduleConfigId.toString()} not found`,
    );
  }

  const slotCatalog = buildSlotCatalog({
    periodDurationM: scheduleConfig.periodDurationM,
    morningStartTime: scheduleConfig.morningStartTime,
    morningEndTime: scheduleConfig.morningEndTime,
    afternoonStartTime: scheduleConfig.afternoonStartTime,
    afternoonEndTime: scheduleConfig.afternoonEndTime,
  });

  const configCourseIds = scheduleConfig.configCourses.map(
    (configCourse) => configCourse.configCourseId,
  );

  const courseProfessorRelations =
    configCourseIds.length === 0
      ? []
      : await prismaService.configCourseProfessor.findMany({
          where: {
            active: true,
            configCourseId: { in: configCourseIds },
          },
          include: {
            configProfessor: true,
          },
        });

  const professorPoolIds = scheduleConfig.configProfessors
    .filter((configProfessor) => configProfessor.active)
    .map((configProfessor) => configProfessor.configProfessorId);

  const professorAvailability = new Map(
    scheduleConfig.configProfessors
      .filter((configProfessor) => configProfessor.active)
      .map((configProfessor) => [
        configProfessor.configProfessorId,
        {
          entryMinute: toMinuteOfDay(configProfessor.professor.entryTime),
          exitMinute: toMinuteOfDay(configProfessor.professor.exitTime),
        },
      ]),
  );

  const classroomPoolById = new Map(
    scheduleConfig.configClassrooms
      .filter((configClassroom) => configClassroom.active)
      .map((configClassroom) => [
        configClassroom.configClassroomId,
        configClassroom,
      ]),
  );

  const specificProfessorByCourse = new Map<bigint, bigint[]>();
  for (const relation of courseProfessorRelations) {
    if (!relation.configProfessor.active) {
      continue;
    }
    const current =
      specificProfessorByCourse.get(relation.configCourseId) ?? [];
    current.push(relation.configProfessorId);
    specificProfessorByCourse.set(relation.configCourseId, current);
  }

  const geneOptionsByKey = new Map<string, GeneAssignmentOptions>();
  const initialGenes: Gene[] = [];

  for (const configCourse of scheduleConfig.configCourses) {
    const sectionQty = Math.max(1, Math.min(2, configCourse.sectionQty));
    const course = configCourse.course;
    const academicTargets = toAcademicTargets(course.courseCareers);

    const derivedCareerCodes = uniqueNumbers(
      academicTargets.map((target) => target.careerCode),
    );
    const primaryTarget =
      academicTargets.find((target) => target.isMandatory) ??
      academicTargets[0];

    const professorCandidates =
      specificProfessorByCourse.get(configCourse.configCourseId) ??
      professorPoolIds;

    const classClassroomCandidates = getCompatibleClassroomIds(
      scheduleConfig.configClassrooms,
      configCourse.typeOfSchedule,
      SessionType.CLASS,
    );

    const labClassroomCandidates = getCompatibleClassroomIds(
      scheduleConfig.configClassrooms,
      configCourse.typeOfSchedule,
      SessionType.LAB,
    );

    for (let sectionIndex = 1; sectionIndex <= sectionQty; sectionIndex += 1) {
      const selectedProfessorId = professorCandidates[0];
      const selectedProfessorAvailability = selectedProfessorId
        ? professorAvailability.get(selectedProfessorId)
        : undefined;
      const fixedDayIndex =
        configCourse.isFixed && configCourse.fixedDayIndex !== null
          ? toDayIndex(configCourse.fixedDayIndex)
          : undefined;

      const classGene: Gene = {
        geneId: createGeneId(
          configCourse.configCourseId,
          sectionIndex,
          SessionType.CLASS,
        ),
        scheduleConfigId: scheduleConfig.scheduleConfigId,
        configCourseId: configCourse.configCourseId,
        courseCode: configCourse.courseCode,
        academicTargets,
        careerCodes: derivedCareerCodes,
        semester: primaryTarget?.semester ?? course.semester ?? 1,
        isMandatory: primaryTarget?.isMandatory ?? course.isMandatory,
        isCommonArea: course.isCommonArea,
        sectionIndex: sectionIndex as 1 | 2,
        sessionType: SessionType.CLASS,
        dayIndex: fixedDayIndex ?? CLASS_DAY_INDEX,
        startSlot:
          configCourse.isFixed && configCourse.fixedStartSlot !== null
            ? configCourse.fixedStartSlot
            : 0,
        periodCount: Math.max(1, course.numberOfPeriods),
        requireClassroom: configCourse.requireClassroom,
        configClassroomId: configCourse.configClassroomId ?? undefined,
        configProfessorId: selectedProfessorId,
        professorEntryMinute: selectedProfessorAvailability?.entryMinute,
        professorExitMinute: selectedProfessorAvailability?.exitMinute,
        fixedDayIndex,
        fixedStartSlot:
          configCourse.isFixed && configCourse.fixedStartSlot !== null
            ? configCourse.fixedStartSlot
            : undefined,
        assignmentStatus: computeAssignmentStatus(
          configCourse.requireClassroom,
          selectedProfessorId,
          configCourse.configClassroomId ?? undefined,
        ),
        isFixed: configCourse.isFixed,
      };

      initialGenes.push(classGene);
      geneOptionsByKey.set(getGeneOptionKey(classGene), {
        classPeriodCount: Math.max(1, course.numberOfPeriods),
        requireClassroom: configCourse.requireClassroom,
        defaultClassroomId: configCourse.configClassroomId ?? undefined,
        professorCandidates,
        classroomCandidates: classClassroomCandidates,
        professorAvailability,
      });

      if (course.hasLab) {
        const labGene: Gene = {
          ...classGene,
          geneId: createGeneId(
            configCourse.configCourseId,
            sectionIndex,
            SessionType.LAB,
          ),
          sessionType: SessionType.LAB,
          dayIndex: randomLabDayIndex(),
          periodCount: 3,
          isFixed: false,
          fixedDayIndex: undefined,
          fixedStartSlot: undefined,
        };
        initialGenes.push(labGene);
        geneOptionsByKey.set(getGeneOptionKey(labGene), {
          classPeriodCount: 3,
          requireClassroom: configCourse.requireClassroom,
          defaultClassroomId: configCourse.configClassroomId ?? undefined,
          professorCandidates,
          classroomCandidates: labClassroomCandidates,
          professorAvailability,
        });
      }
    }

    if (
      configCourse.configClassroomId &&
      !classroomPoolById.has(configCourse.configClassroomId)
    ) {
      for (const gene of initialGenes) {
        if (gene.configCourseId !== configCourse.configCourseId) {
          continue;
        }
        if (gene.requireClassroom) {
          gene.configClassroomId = undefined;
          gene.assignmentStatus = computeAssignmentStatus(
            gene.requireClassroom,
            gene.configProfessorId,
            gene.configClassroomId,
          );
        }
      }
    }
  }

  return {
    scheduleConfigId,
    slotCatalog,
    classrooms: scheduleConfig.configClassrooms.map((configClassroom) => ({
      configClassroomId: configClassroom.configClassroomId,
      classroomName: configClassroom.classroom.name,
    })),
    selectionMethod: scheduleConfig.selectionMethod,
    crossMethod: scheduleConfig.crossMethod,
    mutationMethod: scheduleConfig.mutationMethod,
    maxGeneration: scheduleConfig.maxGeneration ?? 100,
    populationSize: parsePopulationSize(scheduleConfig.startPopulationSize),
    initialGenes,
    geneOptionsByKey,
  };
}

export function getGeneOptionKey(
  gene: Pick<Gene, 'configCourseId' | 'sectionIndex' | 'sessionType'>,
): string {
  return `${gene.configCourseId.toString()}:${gene.sectionIndex}:${gene.sessionType}`;
}

function parsePopulationSize(value: number | null): number {
  if (value === null || value === undefined) {
    return 40;
  }
  if (value <= 1) {
    return 40;
  }
  return Math.min(value, 500);
}

function computeAssignmentStatus(
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

function getCompatibleClassroomIds(
  configClassrooms: Array<{
    configClassroomId: bigint;
    typeOfSchedule: string;
    classroomType: 'CLASS' | 'LAB' | 'BOTH';
    active: boolean;
  }>,
  courseTypeOfSchedule: string,
  sessionType: SessionType,
): bigint[] {
  return configClassrooms
    .filter((classroom) => classroom.active)
    .filter((classroom) =>
      isScheduleTypeCompatible(courseTypeOfSchedule, classroom.typeOfSchedule),
    )
    .filter((classroom) =>
      isClassroomTypeCompatible(classroom.classroomType, sessionType),
    )
    .map((classroom) => classroom.configClassroomId);
}

function isScheduleTypeCompatible(
  courseType: string,
  classroomScheduleType: string,
): boolean {
  const normalizedCourse = courseType.toUpperCase();
  const normalizedClassroom = classroomScheduleType.toUpperCase();

  if (normalizedCourse === 'BOTH' || normalizedClassroom === 'BOTH') {
    return true;
  }
  return normalizedCourse === normalizedClassroom;
}

function isClassroomTypeCompatible(
  classroomType: 'CLASS' | 'LAB' | 'BOTH',
  sessionType: SessionType,
): boolean {
  if (classroomType === 'BOTH') {
    return true;
  }
  if (sessionType === SessionType.LAB) {
    return classroomType === 'LAB';
  }
  return classroomType === 'CLASS';
}

function toAcademicTargets(
  courseCareers: Array<{
    careerCode: number;
    semester: number;
    isMandatory: boolean;
  }>,
): AcademicTarget[] {
  return courseCareers.map((courseCareer) => ({
    careerCode: courseCareer.careerCode,
    semester: courseCareer.semester,
    isMandatory: courseCareer.isMandatory,
  }));
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)];
}

function randomLabDayIndex(): DayIndex {
  return Math.random() < 0.5 ? LAB1_DAY_INDEX : LAB2_DAY_INDEX;
}

function toMinuteOfDay(value: Date): number {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function toDayIndex(value: number): DayIndex {
  if (!isDayIndex(value)) {
    return CLASS_DAY_INDEX;
  }
  return value;
}

function createGeneId(
  configCourseId: bigint,
  sectionIndex: number,
  sessionType: SessionType,
): string {
  return `${configCourseId.toString()}-${sectionIndex}-${sessionType}`;
}
