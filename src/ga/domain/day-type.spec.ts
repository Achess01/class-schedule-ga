import {
  CLASS_DAY_INDEX,
  DayType,
  isDayIndex,
  LAB1_DAY_INDEX,
  LAB2_DAY_INDEX,
  toDayType,
  toDayTypeFromNumber,
} from './day-type';

describe('day-type domain', () => {
  it('maps dayIndex values to DayType', () => {
    expect(toDayType(CLASS_DAY_INDEX)).toBe(DayType.CLASS);
    expect(toDayType(LAB1_DAY_INDEX)).toBe(DayType.LAB1);
    expect(toDayType(LAB2_DAY_INDEX)).toBe(DayType.LAB2);
  });

  it('validates day indexes as 0, 1, 2 only', () => {
    expect(isDayIndex(0)).toBe(true);
    expect(isDayIndex(1)).toBe(true);
    expect(isDayIndex(2)).toBe(true);
    expect(isDayIndex(3)).toBe(false);
    expect(isDayIndex(-1)).toBe(false);
  });

  it('throws for invalid numeric day index', () => {
    expect(() => toDayTypeFromNumber(4)).toThrow(
      'Invalid dayIndex 4. Allowed values are 0, 1, 2.',
    );
  });
});
