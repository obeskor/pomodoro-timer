import { describe, expect, it } from 'vitest';
import {
  formatTime,
  nextStage,
  normalizeSettings,
  stageDurationSeconds,
} from '../lib/timer';
import { DEFAULT_SETTINGS, type Settings } from '../types';

const settings: Settings = { workMin: 25, shortBreakMin: 5, longBreakMin: 15 };

describe('nextStage', () => {
  it('после работы даёт короткий перерыв, пока помодоро не кратно 4', () => {
    expect(nextStage('work', 1)).toBe('shortBreak');
    expect(nextStage('work', 2)).toBe('shortBreak');
    expect(nextStage('work', 3)).toBe('shortBreak');
  });

  it('после каждого 4-го помодоро даёт длинный перерыв', () => {
    expect(nextStage('work', 4)).toBe('longBreak');
    expect(nextStage('work', 8)).toBe('longBreak');
  });

  it('после любого перерыва возвращает к работе', () => {
    expect(nextStage('shortBreak', 2)).toBe('work');
    expect(nextStage('longBreak', 4)).toBe('work');
  });
});

describe('stageDurationSeconds', () => {
  it('возвращает длительность каждого этапа в секундах', () => {
    expect(stageDurationSeconds('work', settings)).toBe(25 * 60);
    expect(stageDurationSeconds('shortBreak', settings)).toBe(5 * 60);
    expect(stageDurationSeconds('longBreak', settings)).toBe(15 * 60);
  });
});

describe('formatTime', () => {
  it('форматирует MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(1500)).toBe('25:00');
  });

  it('не допускает отрицательных значений', () => {
    expect(formatTime(-10)).toBe('00:00');
  });
});

describe('normalizeSettings', () => {
  it('принимает корректный объект', () => {
    expect(normalizeSettings({ workMin: 30, shortBreakMin: 10, longBreakMin: 20 })).toEqual({
      workMin: 30,
      shortBreakMin: 10,
      longBreakMin: 20,
    });
  });

  it('возвращает null для некорректных данных', () => {
    expect(normalizeSettings(null)).toBeNull();
    expect(normalizeSettings('x')).toBeNull();
    expect(normalizeSettings({ workMin: '25' })).toBeNull();
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, workMin: 0 })).toBeNull();
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, workMin: 999 })).toBeNull();
  });
});
