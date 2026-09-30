import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadHistory,
  loadSettings,
  loadTheme,
  saveHistory,
  saveSettings,
  saveTheme,
} from '../lib/storage';
import { DEFAULT_SETTINGS, MAX_HISTORY } from '../types';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('возвращает значения по умолчанию при первом запуске', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(loadTheme()).toBe('light');
    expect(loadHistory()).toEqual([]);
  });

  it('сохраняет и читает настройки', () => {
    saveSettings({ workMin: 30, shortBreakMin: 7, longBreakMin: 20 });
    expect(loadSettings()).toEqual({ workMin: 30, shortBreakMin: 7, longBreakMin: 20 });
  });

  it('откатывается к значениям по умолчанию при битых настройках', () => {
    localStorage.setItem('pomodoro:settings', '{not json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    localStorage.setItem('pomodoro:settings', JSON.stringify({ workMin: -5 }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('сохраняет и читает тему', () => {
    saveTheme('dark');
    expect(loadTheme()).toBe('dark');
    localStorage.setItem('pomodoro:theme', JSON.stringify('unknown'));
    expect(loadTheme()).toBe('light');
  });

  it('фильтрует некорректные записи истории', () => {
    localStorage.setItem(
      'pomodoro:history',
      JSON.stringify([
        { completedAt: new Date().toISOString(), workMinutes: 25 },
        { completedAt: 'not-a-date', workMinutes: 25 },
        { workMinutes: 25 },
        'nonsense',
      ]),
    );
    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].workMinutes).toBe(25);
  });

  it('ограничивает объём истории', () => {
    const entries = Array.from({ length: MAX_HISTORY + 20 }, (_, index) => ({
      completedAt: new Date(Date.now() - index * 1000).toISOString(),
      workMinutes: 25,
    }));
    saveHistory(entries);
    expect(loadHistory().length).toBe(MAX_HISTORY);
  });
});
