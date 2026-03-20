import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionType } from '../../ga/domain/session-type';
import type { Chromosome } from '../../ga/domain/chromosome';
import { AssignmentStatus } from '../../ga/domain/assignment-status';
import { buildSlotCatalog } from '../../ga/domain/slot-catalog';
import { evaluateChromosome } from '../../ga/fitness/fitness-evaluator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeneratedScheduleService {
  constructor(private readonly prismaService: PrismaService) {}

  async createFromChromosome(
    scheduleConfigId: bigint,
    chromosome: Chromosome,
    snapshot: {
      periodDurationM: number;
      morningStartTime: Date;
      morningEndTime: Date;
      afternoonStartTime: Date;
      afternoonEndTime: Date;
    },
    createdBy?: string,
  ) {
    const generatedSchedule = await this.prismaService.generatedSchedule.create(
      {
        data: {
          scheduleConfigId,
          periodDurationM: snapshot.periodDurationM,
          morningStartTime: snapshot.morningStartTime,
          morningEndTime: snapshot.morningEndTime,
          afternoonStartTime: snapshot.afternoonStartTime,
          afternoonEndTime: snapshot.afternoonEndTime,
          name: `Generated ${new Date().toISOString()}`,
          status: 'DRAFT',
          fitness: chromosome.fitness,
          hardPenalty: chromosome.hardPenalty,
          softPenalty: chromosome.softPenalty,
          feasibilityPenalty: chromosome.feasibilityPenalty,
          requiredGeneCount: chromosome.metrics.requiredGeneCount,
          assignedGeneCount: chromosome.metrics.assignedGeneCount,
          unassignedClassroomCount: chromosome.metrics.unassignedClassroomCount,
          unassignedProfessorCount: chromosome.metrics.unassignedProfessorCount,
          createdBy,
        },
      },
    );

    if (chromosome.genes.length > 0) {
      await this.prismaService.generatedScheduleItem.createMany({
        data: chromosome.genes.map((gene) => ({
          generatedScheduleId: generatedSchedule.generatedScheduleId,
          configCourseId: gene.configCourseId,
          courseCode: gene.courseCode,
          sectionIndex: gene.sectionIndex,
          sessionType: gene.sessionType,
          dayIndex: gene.dayIndex,
          startSlot: gene.startSlot,
          periodCount: gene.periodCount,
          requireClassroom: gene.requireClassroom,
          configClassroomId: gene.configClassroomId,
          configProfessorId: gene.configProfessorId,
          assignmentStatus: gene.assignmentStatus,
          isFixed: gene.isFixed,
          semester: gene.semester,
          isMandatory: gene.isMandatory,
          isCommonArea: gene.isCommonArea,
          careerCodes: gene.careerCodes,
          createdBy,
        })),
      });
    }

    return generatedSchedule;
  }

  async findOne(generatedScheduleId: bigint) {
    const generatedSchedule =
      await this.prismaService.generatedSchedule.findUnique({
        where: { generatedScheduleId },
        include: {
          items: {
            where: { active: true },
            include: {
              configCourse: {
                include: {
                  course: true,
                },
              },
              configClassroom: {
                include: {
                  classroom: true,
                },
              },
              configProfessor: {
                include: {
                  professor: true,
                },
              },
            },
            orderBy: [
              { dayIndex: 'asc' },
              { startSlot: 'asc' },
              { generatedScheduleItemId: 'asc' },
            ],
          },
        },
      });

    if (!generatedSchedule || !generatedSchedule.active) {
      throw new NotFoundException(
        `GeneratedSchedule with id ${generatedScheduleId.toString()} not found`,
      );
    }

    const items = generatedSchedule.items.map((item) => ({
      generatedScheduleItemId: item.generatedScheduleItemId,
      configCourseId: item.configCourseId,
      courseCode: item.courseCode,
      courseName: item.configCourse.course.name,
      sectionIndex: item.sectionIndex,
      sessionType: item.sessionType,
      dayIndex: item.dayIndex,
      startSlot: item.startSlot,
      periodCount: item.periodCount,
      requireClassroom: item.requireClassroom,
      configClassroomId: item.configClassroomId,
      classroomName: item.configClassroom?.classroom.name,
      configProfessorId: item.configProfessorId,
      professorName: item.configProfessor
        ? `${item.configProfessor.professor.firstName} ${item.configProfessor.professor.lastName}`
        : undefined,
      assignmentStatus: item.assignmentStatus,
      isFixed: item.isFixed,
      semester: item.semester,
      isMandatory: item.isMandatory,
      isCommonArea: item.isCommonArea,
      careerCodes: item.careerCodes,
    }));

    const slotCatalog = buildSlotCatalog({
      periodDurationM: generatedSchedule.periodDurationM,
      morningStartTime: generatedSchedule.morningStartTime,
      morningEndTime: generatedSchedule.morningEndTime,
      afternoonStartTime: generatedSchedule.afternoonStartTime,
      afternoonEndTime: generatedSchedule.afternoonEndTime,
    });

    const response: Record<string, unknown> = {
      generatedScheduleId: generatedSchedule.generatedScheduleId,
      scheduleConfigId: generatedSchedule.scheduleConfigId,
      snapshot: {
        periodDurationM: generatedSchedule.periodDurationM,
        morningStartTime: generatedSchedule.morningStartTime,
        morningEndTime: generatedSchedule.morningEndTime,
        afternoonStartTime: generatedSchedule.afternoonStartTime,
        afternoonEndTime: generatedSchedule.afternoonEndTime,
      },
      status: generatedSchedule.status,
      fitness: generatedSchedule.fitness,
      hardPenalty: generatedSchedule.hardPenalty,
      softPenalty: generatedSchedule.softPenalty,
      feasibilityPenalty: generatedSchedule.feasibilityPenalty,
      requiredGeneCount: generatedSchedule.requiredGeneCount,
      assignedGeneCount: generatedSchedule.assignedGeneCount,
      unassignedClassroomCount: generatedSchedule.unassignedClassroomCount,
      unassignedProfessorCount: generatedSchedule.unassignedProfessorCount,
      slots: slotCatalog.byDay[0].map((slot) => ({
        slotIndex: slot.slotIndex,
        startMinuteOfDay: slot.startMinuteOfDay,
        endMinuteOfDay: slot.endMinuteOfDay,
        startTime: toHourMinute(slot.startMinuteOfDay),
        endTime: toHourMinute(slot.endMinuteOfDay),
        label: `${toHourMinute(slot.startMinuteOfDay)}-${toHourMinute(slot.endMinuteOfDay)}`,
      })),
      items,
      createdAt: generatedSchedule.createdAt,
      updatedAt: generatedSchedule.updatedAt,
    };

    return response;
  }

  async updateItem(
    generatedScheduleId: bigint,
    generatedScheduleItemId: bigint,
    data: {
      dayIndex?: number;
      startSlot?: number;
      periodCount?: number;
      configClassroomId?: bigint | null;
      configProfessorId?: bigint | null;
    },
    updatedBy?: string,
  ) {
    const schedule = await this.prismaService.generatedSchedule.findUnique({
      where: { generatedScheduleId },
    });

    if (!schedule || !schedule.active) {
      throw new NotFoundException(
        `GeneratedSchedule with id ${generatedScheduleId.toString()} not found`,
      );
    }

    await this.prismaService.generatedScheduleItem.update({
      where: { generatedScheduleItemId },
      data: {
        dayIndex: data.dayIndex,
        startSlot: data.startSlot,
        periodCount: data.periodCount,
        configClassroomId:
          data.configClassroomId === null ? null : data.configClassroomId,
        configProfessorId:
          data.configProfessorId === null ? null : data.configProfessorId,
        updatedBy,
      },
    });

    const items = await this.prismaService.generatedScheduleItem.findMany({
      where: {
        generatedScheduleId,
        active: true,
      },
      include: {
        configProfessor: {
          include: {
            professor: true,
          },
        },
      },
    });

    const slotCatalog = buildSlotCatalog({
      periodDurationM: schedule.periodDurationM,
      morningStartTime: schedule.morningStartTime,
      morningEndTime: schedule.morningEndTime,
      afternoonStartTime: schedule.afternoonStartTime,
      afternoonEndTime: schedule.afternoonEndTime,
    });

    const chromosome: Chromosome = {
      chromosomeId: generatedScheduleId.toString(),
      scheduleConfigId: schedule.scheduleConfigId,
      genes: items.map((item) => ({
        geneId: item.generatedScheduleItemId.toString(),
        scheduleConfigId: schedule.scheduleConfigId,
        configCourseId: item.configCourseId,
        courseCode: item.courseCode,
        academicTargets: [],
        careerCodes: item.careerCodes,
        semester: item.semester,
        isMandatory: item.isMandatory,
        isCommonArea: item.isCommonArea,
        sectionIndex: item.sectionIndex === 2 ? 2 : 1,
        sessionType: toSessionType(item.sessionType),
        dayIndex: toDayIndex(item.dayIndex),
        startSlot: item.startSlot,
        periodCount: item.periodCount,
        requireClassroom: item.requireClassroom,
        configClassroomId: item.configClassroomId ?? undefined,
        configProfessorId: item.configProfessorId ?? undefined,
        professorEntryMinute: item.configProfessor
          ? toMinuteOfDay(item.configProfessor.professor.entryTime)
          : undefined,
        professorExitMinute: item.configProfessor
          ? toMinuteOfDay(item.configProfessor.professor.exitTime)
          : undefined,
        assignmentStatus: toAssignmentStatus(item.assignmentStatus),
        isFixed: item.isFixed,
      })),
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
      createdAt: new Date(),
    };

    const evaluated = evaluateChromosome(chromosome, slotCatalog);

    await this.prismaService.generatedSchedule.update({
      where: { generatedScheduleId },
      data: {
        fitness: evaluated.fitness,
        hardPenalty: evaluated.hardPenalty,
        softPenalty: evaluated.softPenalty,
        feasibilityPenalty: evaluated.feasibilityPenalty,
        requiredGeneCount: evaluated.metrics.requiredGeneCount,
        assignedGeneCount: evaluated.metrics.assignedGeneCount,
        unassignedClassroomCount: evaluated.metrics.unassignedClassroomCount,
        unassignedProfessorCount: evaluated.metrics.unassignedProfessorCount,
        updatedBy,
      },
    });

    return {
      generatedScheduleId,
      updatedItemId: generatedScheduleItemId,
      warnings: evaluated.violations.map((code) => ({
        code,
        severity: 'warning',
        message: code,
      })),
      summary: {
        fitness: evaluated.fitness,
        hardPenalty: evaluated.hardPenalty,
        softPenalty: evaluated.softPenalty,
        feasibilityPenalty: evaluated.feasibilityPenalty,
      },
    };
  }
}

function toMinuteOfDay(value: Date): number {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function toHourMinute(minuteOfDay: number): string {
  const hours = Math.floor(minuteOfDay / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (minuteOfDay % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function toDayIndex(value: number): 0 | 1 | 2 {
  if (value === 1) {
    return 1;
  }
  if (value === 2) {
    return 2;
  }
  return 0;
}

function toSessionType(value: string): SessionType {
  return value === 'LAB' ? SessionType.LAB : SessionType.CLASS;
}

function toAssignmentStatus(value: string): AssignmentStatus {
  switch (value) {
    case 'ASSIGNED':
      return AssignmentStatus.ASSIGNED;
    case 'UNASSIGNED_CLASSROOM':
      return AssignmentStatus.UNASSIGNED_CLASSROOM;
    case 'UNASSIGNED_PROFESSOR':
      return AssignmentStatus.UNASSIGNED_PROFESSOR;
    case 'UNASSIGNED_BOTH':
      return AssignmentStatus.UNASSIGNED_BOTH;
    default:
      return AssignmentStatus.ASSIGNED;
  }
}
