import type { AssignmentStatus } from './assignment-status';
import type { DayIndex } from './day-type';
import type { SessionType } from './session-type';

export interface Gene {
  geneId: string;
  scheduleConfigId: bigint;
  configCourseId: bigint;
  courseCode: number;
  careerCodes: number[];
  semester: number;
  isMandatory: boolean;
  isCommonArea: boolean;
  sectionIndex: 1 | 2;
  sessionType: SessionType;
  dayIndex: DayIndex;
  startSlot: number;
  periodCount: number;
  requireClassroom: boolean;
  configClassroomId?: bigint;
  configProfessorId?: bigint;
  assignmentStatus: AssignmentStatus;
  isFixed: boolean;
}
