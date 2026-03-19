import { SessionType } from './domain/session-type';
import { GaService } from './ga.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

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
          startPopulationNumber: '25',
          selectionMethod: 1,
          crossMethod: 2,
          mutationMethod: 1,
          active: true,
          configProfessors: [
            { configProfessorId: 101n, active: true },
            { configProfessorId: 102n, active: true },
            { configProfessorId: 103n, active: true },
          ],
          configClassrooms: [
            {
              configClassroomId: 201n,
              typeOfSchedule: 'MORNING',
              active: true,
            },
            {
              configClassroomId: 202n,
              typeOfSchedule: 'AFTERNOON',
              active: true,
            },
            { configClassroomId: 203n, typeOfSchedule: 'BOTH', active: true },
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
    } as unknown as ConstructorParameters<typeof GaService>[0];

    const service = new GaService(prismaMock);
    const result = await service.generate(1);
    console.log(result);

    expect(result.scheduleConfigId).toBe(1n);
    expect(result.genes.length).toBeGreaterThan(0);
    expect(result.metrics.requiredGeneCount).toBe(result.genes.length);
    expect(result.fitness).toBeGreaterThan(0);

    for (const gene of result.genes) {
      expect([0, 1, 2]).toContain(gene.dayIndex);
      expect(gene.startSlot).toBeGreaterThanOrEqual(0);
      expect(gene.periodCount).toBeGreaterThan(0);
      if (gene.sessionType === SessionType.LAB) {
        expect(gene.periodCount).toBe(3);
      }
    }

    const scheduleView = result.genes
      .map((gene) => ({
        dayIndex: gene.dayIndex,
        startSlot: gene.startSlot,
        periodCount: gene.periodCount,
        courseCode: gene.courseCode,
        section: gene.sectionIndex,
        type: gene.sessionType,
        professor: gene.configProfessorId?.toString() ?? 'UNASSIGNED',
        classroom: gene.configClassroomId?.toString() ?? 'UNASSIGNED',
      }))
      .sort(
        (left, right) =>
          left.dayIndex - right.dayIndex || left.startSlot - right.startSlot,
      );

    console.table(scheduleView);
  });
});
