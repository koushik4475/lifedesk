import { describe, expect, it } from 'vitest';
import { validateBackup } from '../lib/backup';
import { monthCategoryTotals, nextOccurrence, recordsMissingLocally, resolveTransactionCurrency, toMinorUnits } from '../lib/domain';

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

describe('transaction currency', () => {
  it('preserves the original currency when editing an existing transaction', () => {
    expect(resolveTransactionCurrency('USD', 'INR')).toBe('USD');
  });

  it('uses the current currency preference for a new transaction', () => {
    expect(resolveTransactionCurrency(undefined, 'INR')).toBe('INR');
  });
});


describe('backup merge selection', () => {
  it('keeps existing local records and imports only new unique keys', () => {
    const incoming = [
      { id: 'existing', title: 'Backup version' },
      { id: 'new', title: 'First copy' },
      { id: 'new', title: 'Duplicate copy' },
      { id: 'another', title: 'Another new record' },
    ];

    expect(recordsMissingLocally(incoming, new Set(['existing']), (record) => record.id)).toEqual([
      { id: 'new', title: 'First copy' },
      { id: 'another', title: 'Another new record' },
    ]);
  });

  it('supports non-id primary keys such as settings keys', () => {
    const incoming = [{ key: 'theme', value: 'dark' }, { key: 'currency', value: 'INR' }];
    expect(recordsMissingLocally(incoming, new Set(['theme']), (record) => record.key)).toEqual([
      { key: 'currency', value: 'INR' },
    ]);
  });
});


describe('backup validation', () => {
  const backup = (localDate: string) => ({
    version: 1,
    exportedAt: '2026-11-22T00:00:00.000Z',
    data: {
      tasks: [], events: [], habits: [],
      habitEntries: [{ id: '00000000-0000-4000-8000-000000000001', habitId: '00000000-0000-4000-8000-000000000002', localDate, completedAt: '2026-11-22T00:00:00.000Z' }],
      notes: [], transactions: [], records: [], settings: [],
    },
  });

  it('accepts ISO calendar dates in habit entries', () => {
    expect(() => validateBackup(backup('2026-11-22'))).not.toThrow();
  });

  it('rejects habit entry dates that are not YYYY-MM-DD', () => {
    expect(() => validateBackup(backup('not-a-date'))).toThrow();
  });
});
