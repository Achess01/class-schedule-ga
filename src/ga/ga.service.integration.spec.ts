import { SessionType } from './domain/session-type';
import { GaService } from './ga.service';
import { GeneratedScheduleService } from '../module/generated-schedule/generated-schedule.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

const asPrismaDependency = <T>(
  value: T,
): ConstructorParameters<typeof GaService>[0] =>
  value as unknown as ConstructorParameters<typeof GaService>[0];

const generatedScheduleServiceMock = {
  createFromChromosome: jest
    .fn()
    .mockResolvedValue({ generatedScheduleId: 1n }),
} as unknown as GeneratedScheduleService;

describe('GaService integration schedule generation', () => {
  it('generates a schedule directly from service using mocked config data', async () => {
    const prismaMock = {
      scheduleConfig: {
        findUnique: jest.fn().mockResolvedValue({
          scheduleConfigId: 1n,
          periodDurationM: 50,
          morningStartTime: new Date('2026-03-19T07:00:00.000Z'),
          morningEndTime: new Date('2026-03-19T12:00:00.000Z'),
          afternoonStartTime: new Date('2026-03-19T13:00:00.000Z'),
          afternoonEndTime: new Date('2026-03-19T17:00:00.000Z'),
          maxGeneration: 100,
          startPopulationSize: 25,
          selectionMethod: 1,
          crossMethod: 2,
          mutationMethod: 1,
          active: true,
          configProfessors: [
            {
              configProfessorId: 101n,
              active: true,
              professor: {
                entryTime: new Date('2026-03-19T07:00:00.000Z'),
                exitTime: new Date('2026-03-19T17:00:00.000Z'),
              },
            },
            {
              configProfessorId: 102n,
              active: true,
              professor: {
                entryTime: new Date('2026-03-19T07:00:00.000Z'),
                exitTime: new Date('2026-03-19T17:00:00.000Z'),
              },
            },
            {
              configProfessorId: 103n,
              active: true,
              professor: {
                entryTime: new Date('2026-03-19T07:00:00.000Z'),
                exitTime: new Date('2026-03-19T17:00:00.000Z'),
              },
            },
          ],
          configClassrooms: [
            {
              configClassroomId: 201n,
              classroomId: 1,
              typeOfSchedule: 'MORNING',
              classroomType: 'CLASS',
              active: true,
              classroom: {
                name: '1',
              },
            },
            {
              configClassroomId: 202n,
              classroomId: 2,
              typeOfSchedule: 'AFTERNOON',
              classroomType: 'LAB',
              active: true,
              classroom: {
                name: '2',
              },
            },
            {
              configClassroomId: 203n,
              classroomId: 3,
              typeOfSchedule: 'BOTH',
              classroomType: 'BOTH',
              active: true,
              classroom: {
                name: '3',
              },
            },
          ],
          configCourses: [
            {
              configCourseId: 301n,
              scheduleConfigId: 1n,
              courseCode: 1201,
              sectionQty: 2,
              scheduleTime: new Date('2026-03-19T07:00:00.000Z'),
              requireClassroom: true,
              typeOfSchedule: 'MORNING',
              isFixed: false,
              fixedDayIndex: null,
              fixedStartSlot: null,
              configClassroomId: null,
              active: true,
              course: {
                courseCode: 1201,
                semester: 4,
                isMandatory: true,
                isCommonArea: false,
                hasLab: false,
                numberOfPeriods: 1,
                courseCareers: [
                  {
                    careerCode: 1,
                    semester: 4,
                    isMandatory: true,
                    active: true,
                  },
                ],
              },
            },
            {
              configCourseId: 302n,
              scheduleConfigId: 1n,
              courseCode: 1301,
              sectionQty: 1,
              scheduleTime: new Date('2026-03-19T09:00:00.000Z'),
              requireClassroom: true,
              typeOfSchedule: 'BOTH',
              isFixed: false,
              fixedDayIndex: null,
              fixedStartSlot: null,
              configClassroomId: null,
              active: true,
              course: {
                courseCode: 1301,
                semester: 4,
                isMandatory: true,
                isCommonArea: true,
                hasLab: true,
                numberOfPeriods: 1,
                courseCareers: [
                  {
                    careerCode: 1,
                    semester: 4,
                    isMandatory: true,
                    active: true,
                  },
                  {
                    careerCode: 2,
                    semester: 4,
                    isMandatory: true,
                    active: true,
                  },
                ],
              },
            },
          ],
        }),
      },
      configCourseProfessor: {
        findMany: jest.fn().mockResolvedValue([
          {
            configCourseId: 301n,
            configProfessorId: 101n,
            active: true,
            configProfessor: { configProfessorId: 101n, active: true },
          },
          {
            configCourseId: 302n,
            configProfessorId: 102n,
            active: true,
            configProfessor: { configProfessorId: 102n, active: true },
          },
        ]),
      },
    };

    const service = new GaService(
      asPrismaDependency(prismaMock),
      generatedScheduleServiceMock,
    );
    const result = await service.generate(1);

    const items =
      (result.items as Array<{
        dayIndex: number;
        startSlot: number;
        periodCount: number;
        sessionType: SessionType;
        courseCode: number;
        sectionIndex: number;
        configProfessorId?: bigint;
        configClassroomId?: bigint;
      }>) ?? [];

    expect(result.scheduleConfigId).toBe(1n);
    expect(items.length).toBeGreaterThan(0);

    const summary = result.summary as {
      requiredGeneCount: number;
      fitness: number;
    };

    expect(summary.requiredGeneCount).toBe(items.length);
    expect(summary.fitness).toBeGreaterThan(0);

    for (const item of items) {
      expect([0, 1, 2]).toContain(item.dayIndex);
      expect(item.startSlot).toBeGreaterThanOrEqual(0);
      expect(item.periodCount).toBeGreaterThan(0);
      if (item.sessionType === SessionType.LAB) {
        expect(item.periodCount).toBe(3);
      }
    }

    const scheduleView = items
      .map((item) => ({
        dayIndex: item.dayIndex,
        startSlot: item.startSlot,
        periodCount: item.periodCount,
        courseCode: item.courseCode,
        section: item.sectionIndex,
        type: item.sessionType,
        professor: item.configProfessorId?.toString() ?? 'UNASSIGNED',
        classroom: item.configClassroomId?.toString() ?? 'UNASSIGNED',
      }))
      .sort(
        (left, right) =>
          left.dayIndex - right.dayIndex || left.startSlot - right.startSlot,
      );

    console.table(scheduleView);
  });
});
