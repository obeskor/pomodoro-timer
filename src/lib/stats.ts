import type { HistoryEntry } from '../types';

function startOfToday(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** Число помодоро, завершённых сегодня. */
export function countToday(history: HistoryEntry[], now: Date = new Date()): number {
  const start = startOfToday(now);
  return history.filter((entry) => {
    const at = Date.parse(entry.completedAt);
    return at >= start && at <= now.getTime();
  }).length;
}
