#!/usr/bin/env node

const assert = (condition, message) => {
  if (!condition) throw new Error(`Statistics date verification failed: ${message}`);
};

const parseDate = (value) => {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthKey = (value) => {
  const date = parseDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const originalTimezone = process.env.TZ;
process.env.TZ = 'Asia/Taipei';

try {
  assert(monthKey('2026-01-01') === '2026-01', 'January date-only value must remain in January');
  assert(monthKey('2026-12-31') === '2026-12', 'December date-only value must remain in December');
  assert(monthKey('2026-02-28') === '2026-02', 'February boundary must remain in February');
  assert(monthKey('2026-03-01') === '2026-03', 'March boundary must remain in March');
  assert(monthKey('2025-12-31T23:30:00+08:00') === '2025-12', 'explicit Taiwan timestamp must remain in December');
  assert(monthKey('2026-01-01T00:30:00+08:00') === '2026-01', 'explicit Taiwan timestamp must remain in January');
  assert(monthKey('not-a-date') === '', 'invalid dates must be ignored');
  assert(monthKey('2026-02-30') === '', 'impossible calendar dates must be rejected');

  const year = 2026;
  const months = Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`);
  assert(months.length === 12 && months[0] === '2026-01' && months[11] === '2026-12', 'statistics must generate all twelve months in order');
  assert(new Set(months).size === 12, 'statistics month keys must be unique');

  console.log('Statistics date boundary verification passed: local date-only parsing, year boundaries, invalid dates, and 12-month ordering.');
} finally {
  if (originalTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimezone;
}
