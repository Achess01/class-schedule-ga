import type { ViolationCode } from './violation-code';

export interface ViolationDetail {
  code: ViolationCode;
  dayIndex: number;
  slotIndex?: number;
  geneIds: string[];
  configCourseIds: bigint[];
  courseCodes: number[];
  sectionIndexes: Array<1 | 2>;
  configProfessorIds: bigint[];
  configClassroomIds: bigint[];
}
