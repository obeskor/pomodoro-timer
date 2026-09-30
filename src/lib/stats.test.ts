import { describe, expect, it } from 'vitest';
import { countToday } from '../lib/stats';
import type { HistoryEntry } from '../types';

const now = new Date('2026-09-30T12:00:00.000Z');

function entry(iso: string): HistoryEntry {
  return { completedAt: iso, workMinutes: 25 };
}

describe('countToday', () => {
  it('считает только помодоро текущего дня', () => {
    const history = [
      entry('2026-09-30T08:00:00.000Z'),
      entry('2026-09-30T11:30:00.000Z'),
      entry('2026-09-29T20:00:00.000Z'),
      entry('2026-09-28T09:00:00.000Z'),
    ];
    expect(countToday(history, now)).toBe(2);
  });

  it('возвращает 0 для пустой истории', () => {
    expect(countToday([], now)).toBe(0);
  });
});
