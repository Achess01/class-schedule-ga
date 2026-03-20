import {
  CLASS_DAY_INDEX,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
} from '../domain/day-type';
import type { Gene } from '../domain/gene';
import type { SlotCatalog } from '../domain/slot-catalog';

export interface ScheduleViewColumn {
  key: string;
  label: string;
}

export interface ScheduleViewRow {
  slot: string;
  cells: Record<string, string>;
}

export interface ScheduleView {
  columns: ScheduleViewColumn[];
  rows: ScheduleViewRow[];
}

export function buildScheduleView(
  genes: Gene[],
  slotCatalog: SlotCatalog,
  classrooms: Array<{ configClassroomId: bigint; classroomName: string }>,
): ScheduleView {
  const columns = classrooms.flatMap((classroom) => [
    {
      key: `${CLASS_DAY_INDEX}:${classroom.configClassroomId.toString()}`,
      label: `CLASS - ${classroom.classroomName}`,
    },
    {
      key: `${LAB1_DAY_INDEX}:${classroom.configClassroomId.toString()}`,
      label: `LAB1 LAB - ${classroom.classroomName}`,
    },
    {
      key: `${LAB2_DAY_INDEX}:${classroom.configClassroomId.toString()}`,
      label: `LAB2 LAB - ${classroom.classroomName}`,
    },
  ]);

  const rows = slotCatalog.byDay[CLASS_DAY_INDEX].map((slot, slotIndex) => {
    const row: ScheduleViewRow = {
      slot: `${toHourMinute(slot.startMinuteOfDay)}-${toHourMinute(slot.endMinuteOfDay)}`,
      cells: {},
    };

    for (const column of columns) {
      row.cells[column.key] = '';
    }

    for (const gene of genes) {
      if (gene.configClassroomId === undefined) {
        continue;
      }

      const geneEndsAt = gene.startSlot + gene.periodCount;
      if (slotIndex < gene.startSlot || slotIndex >= geneEndsAt) {
        continue;
      }

      const columnKey = `${gene.dayIndex}:${gene.configClassroomId.toString()}`;
      const professorLabel = gene.configProfessorId?.toString() ?? 'UNASSIGNED';
      const value = `${gene.courseCode} S${gene.sectionIndex} ${gene.sessionType} P:${professorLabel}`;

      if (row.cells[columnKey]) {
        row.cells[columnKey] = `${row.cells[columnKey]} | ${value}`;
      } else {
        row.cells[columnKey] = value;
      }
    }

    return row;
  });

  return {
    columns,
    rows,
  };
}

function toHourMinute(minuteOfDay: number): string {
  const hours = Math.floor(minuteOfDay / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (minuteOfDay % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
