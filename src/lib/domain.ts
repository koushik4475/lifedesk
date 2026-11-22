import { addDays, addMonths, format, parseISO } from 'date-fns';

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';

export function nextOccurrence(value: string, rule: RepeatRule): string | null {
  if (!value || rule === 'none') return null;
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) throw new Error('A valid due date is required');
  const next = rule === 'daily' ? addDays(date, 1) : rule === 'weekly' ? addDays(date, 7) : addMonths(date, 1);
  return format(next, "yyyy-MM-dd'T'HH:mm");
}

export function toMinorUnits(amount: string | number): number {
  const raw = String(amount).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error('Amount must be a non-negative value with at most two decimal places');
  }
  const [whole, fraction = ''] = raw.split('.');
  const minorUnits = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error('Amount is too large to store safely');
  }
  return minorUnits;
}

export function monthCategoryTotals(rows: { type: string; category: string; amountMinor: number }[]) {
  return rows
    .filter((row) => row.type === 'expense')
    .reduce<Record<string, number>>((totals, row) => {
      totals[row.category] = (totals[row.category] || 0) + row.amountMinor;
      return totals;
    }, {});
}
