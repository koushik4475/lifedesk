import { describe, expect, it } from 'vitest';
import { monthCategoryTotals, nextOccurrence, toMinorUnits } from '../lib/domain';

describe('date and money domain logic', () => {
  it('advances daily and weekly recurrences over month boundaries', () => {
    expect(nextOccurrence('2026-01-31T09:00', 'daily')).toBe('2026-02-01T09:00');
    expect(nextOccurrence('2026-01-31T09:00', 'weekly')).toBe('2026-02-07T09:00');
  });

  it('clamps monthly recurrence to the last valid day', () => {
    expect(nextOccurrence('2026-01-31T09:00', 'monthly')).toBe('2026-02-28T09:00');
  });

  it('returns no occurrence for a non-recurring task', () => {
    expect(nextOccurrence('2026-01-01T09:00', 'none')).toBeNull();
  });

  it('rejects invalid recurrence dates', () => {
    expect(() => nextOccurrence('not-a-date', 'daily')).toThrow('valid due date');
  });

  it('stores rupee amounts as integer paise', () => {
    expect(toMinorUnits('12.34')).toBe(1234);
    expect(toMinorUnits('0.01')).toBe(1);
    expect(Number.isInteger(toMinorUnits('123'))).toBe(true);
  });

  it('rejects invalid, negative, over-precision and unsafe amounts', () => {
    expect(() => toMinorUnits('abc')).toThrow();
    expect(() => toMinorUnits(-1)).toThrow();
    expect(() => toMinorUnits('1.234')).toThrow();
    expect(() => toMinorUnits('90071992547409.92')).toThrow('too large');
  });

  it('groups monthly expense amounts by category without including income', () => {
    expect(monthCategoryTotals([
      { type: 'expense', category: 'Food', amountMinor: 100 },
      { type: 'expense', category: 'Food', amountMinor: 50 },
      { type: 'income', category: 'Food', amountMinor: 900 },
    ])).toEqual({ Food: 150 });
  });
});
