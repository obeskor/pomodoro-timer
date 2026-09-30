import {
  DEFAULT_SETTINGS,
  MAX_HISTORY,
  type HistoryEntry,
  type Settings,
  type Theme,
} from '../types';
import { normalizeSettings } from './timer';

export const STORAGE_KEYS = {
  settings: 'pomodoro:settings',
  theme: 'pomodoro:theme',
  history: 'pomodoro:history',
} as const;

function safeParse(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Хранилище недоступно или переполнено — молча игнорируем.
  }
}

export function loadSettings(): Settings {
  return normalizeSettings(safeParse(STORAGE_KEYS.settings)) ?? DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  safeSet(STORAGE_KEYS.settings, settings);
}

export function loadTheme(): Theme {
  const raw = safeParse(STORAGE_KEYS.theme);
  return raw === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: Theme): void {
  safeSet(STORAGE_KEYS.theme, theme);
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.completedAt !== 'string') return false;
  if (typeof entry.workMinutes !== 'number' || !Number.isFinite(entry.workMinutes)) {
    return false;
  }
  return !Number.isNaN(Date.parse(entry.completedAt));
}

export function loadHistory(): HistoryEntry[] {
  const raw = safeParse(STORAGE_KEYS.history);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isHistoryEntry).slice(-MAX_HISTORY);
}

export function saveHistory(history: HistoryEntry[]): void {
  safeSet(STORAGE_KEYS.history, history.slice(-MAX_HISTORY));
}
