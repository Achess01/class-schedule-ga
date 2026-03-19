import {
  CLASS_DAY_INDEX,
  type DayIndex,
  DAY_INDEXES,
  isDayIndex,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
} from './day-type';

export interface Slot {
  dayIndex: DayIndex;
  slotIndex: number;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
  isMorning: boolean;
}

export interface SlotCatalog {
  periodDurationM: number;
  morningStartMinuteOfDay: number;
  morningEndMinuteOfDay: number;
  afternoonStartMinuteOfDay: number;
  afternoonEndMinuteOfDay: number;
  slotsPerDay: number;
  morningSlotCount: number;
  afternoonSlotCount: number;
  byDay: Record<DayIndex, Slot[]>;
  all: Slot[];
}

export interface SlotCatalogInput {
  periodDurationM: number;
  morningStartTime: Date;
  morningEndTime: Date;
  afternoonStartTime: Date;
  afternoonEndTime: Date;
}

export function buildSlotCatalog(input: SlotCatalogInput): SlotCatalog {
  if (input.periodDurationM <= 0) {
    throw new RangeError('periodDurationM must be greater than 0.');
  }

  const morningStartMinuteOfDay = toMinuteOfDay(input.morningStartTime);
  const morningEndMinuteOfDay = toMinuteOfDay(input.morningEndTime);
  const afternoonStartMinuteOfDay = toMinuteOfDay(input.afternoonStartTime);
  const afternoonEndMinuteOfDay = toMinuteOfDay(input.afternoonEndTime);

  if (morningEndMinuteOfDay <= morningStartMinuteOfDay) {
    throw new RangeError(
      'morningEndTime must be greater than morningStartTime.',
    );
  }

  if (afternoonEndMinuteOfDay <= afternoonStartMinuteOfDay) {
    throw new RangeError(
      'afternoonEndTime must be greater than afternoonStartTime.',
    );
  }

  if (afternoonStartMinuteOfDay < morningEndMinuteOfDay) {
    throw new RangeError(
      'afternoonStartTime must be greater than or equal to morningEndTime.',
    );
  }

  const morningMinutes = morningEndMinuteOfDay - morningStartMinuteOfDay;
  const afternoonMinutes = afternoonEndMinuteOfDay - afternoonStartMinuteOfDay;

  const morningSlotCount = Math.floor(morningMinutes / input.periodDurationM);
  const afternoonSlotCount = Math.floor(
    afternoonMinutes / input.periodDurationM,
  );
  const slotsPerDay = morningSlotCount + afternoonSlotCount;

  const byDay = {
    [CLASS_DAY_INDEX]: [] as Slot[],
    [LAB1_DAY_INDEX]: [] as Slot[],
    [LAB2_DAY_INDEX]: [] as Slot[],
  } as Record<DayIndex, Slot[]>;

  for (const dayIndex of DAY_INDEXES) {
    let slotIndex = 0;

    for (let i = 0; i < morningSlotCount; i += 1) {
      byDay[dayIndex].push({
        dayIndex,
        slotIndex,
        startMinuteOfDay: morningStartMinuteOfDay + i * input.periodDurationM,
        endMinuteOfDay:
          morningStartMinuteOfDay + (i + 1) * input.periodDurationM,
        isMorning: true,
      });
      slotIndex += 1;
    }

    for (let i = 0; i < afternoonSlotCount; i += 1) {
      byDay[dayIndex].push({
        dayIndex,
        slotIndex,
        startMinuteOfDay: afternoonStartMinuteOfDay + i * input.periodDurationM,
        endMinuteOfDay:
          afternoonStartMinuteOfDay + (i + 1) * input.periodDurationM,
        isMorning: false,
      });
      slotIndex += 1;
    }
  }

  return {
    periodDurationM: input.periodDurationM,
    morningStartMinuteOfDay,
    morningEndMinuteOfDay,
    afternoonStartMinuteOfDay,
    afternoonEndMinuteOfDay,
    slotsPerDay,
    morningSlotCount,
    afternoonSlotCount,
    byDay,
    all: [
      ...byDay[CLASS_DAY_INDEX],
      ...byDay[LAB1_DAY_INDEX],
      ...byDay[LAB2_DAY_INDEX],
    ],
  };
}

export function canFitContiguousBlock(
  slotsPerDay: number,
  startSlot: number,
  periodCount: number,
): boolean {
  if (slotsPerDay <= 0 || startSlot < 0 || periodCount <= 0) {
    return false;
  }
  return startSlot + periodCount <= slotsPerDay;
}

export function getDayIndexForLabIndex(labIndex: 1 | 2): DayIndex {
  return labIndex === 1 ? LAB1_DAY_INDEX : LAB2_DAY_INDEX;
}

function toMinuteOfDay(value: Date): number {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

export function assertDayIndex(dayIndex: number): DayIndex {
  if (!isDayIndex(dayIndex)) {
    throw new RangeError(
      `Invalid dayIndex ${dayIndex}. Allowed values are 0, 1, 2.`,
    );
  }
  return dayIndex;
}
