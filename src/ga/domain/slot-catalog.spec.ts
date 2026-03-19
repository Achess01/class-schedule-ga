import {
  assertDayIndex,
  buildSlotCatalog,
  canFitContiguousBlock,
  getDayIndexForLabIndex,
} from './slot-catalog';

describe('slot-catalog domain', () => {
  it('builds slots and truncates remainder minutes', () => {
    const catalog = buildSlotCatalog({
      periodDurationM: 50,
      morningStartTime: new Date('2026-03-15T07:00:00.000Z'),
      morningEndTime: new Date('2026-03-15T12:15:00.000Z'),
      afternoonStartTime: new Date('2026-03-15T13:00:00.000Z'),
      afternoonEndTime: new Date('2026-03-15T16:45:00.000Z'),
    });

    expect(catalog.morningSlotCount).toBe(6);
    expect(catalog.afternoonSlotCount).toBe(4);
    expect(catalog.slotsPerDay).toBe(10);
    expect(catalog.byDay[0]).toHaveLength(10);
    expect(catalog.byDay[1]).toHaveLength(10);
    expect(catalog.byDay[2]).toHaveLength(10);
    expect(catalog.all).toHaveLength(30);
  });

  it('validates contiguous block fit', () => {
    expect(canFitContiguousBlock(10, 7, 3)).toBe(true);
    expect(canFitContiguousBlock(10, 8, 3)).toBe(false);
  });

  it('maps lab index to day index', () => {
    expect(getDayIndexForLabIndex(1)).toBe(1);
    expect(getDayIndexForLabIndex(2)).toBe(2);
  });

  it('asserts day index values', () => {
    expect(assertDayIndex(0)).toBe(0);
    expect(assertDayIndex(2)).toBe(2);
    expect(() => assertDayIndex(5)).toThrow(
      'Invalid dayIndex 5. Allowed values are 0, 1, 2.',
    );
  });
});
