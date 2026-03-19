export enum DayType {
  CLASS = 'CLASS',
  LAB1 = 'LAB1',
  LAB2 = 'LAB2',
}

export const CLASS_DAY_INDEX = 0 as const;
export const LAB1_DAY_INDEX = 1 as const;
export const LAB2_DAY_INDEX = 2 as const;

export type DayIndex =
  | typeof CLASS_DAY_INDEX
  | typeof LAB1_DAY_INDEX
  | typeof LAB2_DAY_INDEX;

export const DAY_INDEXES: readonly DayIndex[] = [
  CLASS_DAY_INDEX,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
] as const;

export function isDayIndex(value: number): value is DayIndex {
  return (
    value === CLASS_DAY_INDEX ||
    value === LAB1_DAY_INDEX ||
    value === LAB2_DAY_INDEX
  );
}

export function toDayType(dayIndex: DayIndex): DayType {
  switch (dayIndex) {
    case CLASS_DAY_INDEX:
      return DayType.CLASS;
    case LAB1_DAY_INDEX:
      return DayType.LAB1;
    case LAB2_DAY_INDEX:
      return DayType.LAB2;
  }
}

export function toDayTypeFromNumber(dayIndex: number): DayType {
  if (!isDayIndex(dayIndex)) {
    throw new RangeError(
      `Invalid dayIndex ${dayIndex}. Allowed values are 0, 1, 2.`,
    );
  }
  return toDayType(dayIndex);
}
