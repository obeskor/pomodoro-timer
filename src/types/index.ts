export type Stage = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';

export interface Settings {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

export interface HistoryEntry {
  /** ISO-строка момента завершения помодоро. */
  completedAt: string;
  /** Длительность рабочего интервала в минутах. */
  workMinutes: number;
}

/** Количество помодоро до длинного перерыва. */
export const POMODOROS_BEFORE_LONG_BREAK = 4;

export const DEFAULT_SETTINGS: Settings = {
  workMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
};

export const MIN_SETTING = 1;
export const MAX_SETTING = 180;
/** Максимум хранимых записей истории. */
export const MAX_HISTORY = 500;
