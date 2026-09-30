import {
  MAX_SETTING,
  MIN_SETTING,
  POMODOROS_BEFORE_LONG_BREAK,
  type Settings,
  type Stage,
} from '../types';

/**
 * Следующий этап после текущего.
 * work -> longBreak после каждого 4-го помодоро, иначе shortBreak.
 * Любой перерыв -> work.
 */
export function nextStage(stage: Stage, completedPomodoros: number): Stage {
  if (stage === 'work') {
    return completedPomodoros > 0 &&
      completedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0
      ? 'longBreak'
      : 'shortBreak';
  }
  return 'work';
}

/** Длительность этапа в минутах с учётом настроек. */
export function stageDurationMinutes(stage: Stage, settings: Settings): number {
  switch (stage) {
    case 'work':
      return settings.workMin;
    case 'shortBreak':
      return settings.shortBreakMin;
    case 'longBreak':
      return settings.longBreakMin;
  }
}

/** Длительность этапа в секундах. */
export function stageDurationSeconds(stage: Stage, settings: Settings): number {
  return stageDurationMinutes(stage, settings) * 60;
}

/** Перевод длительности в секундах в формат MM:SS. */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Проверка и нормализация настроек из внешнего источника. */
export function normalizeSettings(raw: unknown): Settings | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const candidate = raw as Record<string, unknown>;
  const keys: (keyof Settings)[] = ['workMin', 'shortBreakMin', 'longBreakMin'];
  const result = {} as Settings;
  for (const key of keys) {
    const value = candidate[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    const rounded = Math.round(value);
    if (rounded < MIN_SETTING || rounded > MAX_SETTING) return null;
    result[key] = rounded;
  }
  return result;
}
