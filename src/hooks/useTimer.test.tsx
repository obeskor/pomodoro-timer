import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimer } from '../hooks/useTimer';
import type { Settings } from '../types';

const settings: Settings = { workMin: 1, shortBreakMin: 1, longBreakMin: 1 };

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('стартует в режиме работы с полной длительностью', () => {
    const { result } = renderHook(() => useTimer(settings));
    expect(result.current.stage).toBe('work');
    expect(result.current.status).toBe('idle');
    expect(result.current.remainingSeconds).toBe(60);
  });

  it('отсчитывает время после старта', () => {
    const { result } = renderHook(() => useTimer(settings));
    act(() => result.current.start());
    expect(result.current.status).toBe('running');

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.remainingSeconds).toBe(50);
  });

  it('пауза и продолжение сохраняют остаток', () => {
    const { result } = renderHook(() => useTimer(settings));
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    act(() => result.current.pause());
    expect(result.current.status).toBe('paused');
    expect(result.current.remainingSeconds).toBe(45);

    act(() => result.current.toggle());
    expect(result.current.status).toBe('running');
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.remainingSeconds).toBe(40);
  });

  it('сброс возвращает этап к начальной длительности', () => {
    const { result } = renderHook(() => useTimer(settings));
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.remainingSeconds).toBe(60);
  });

  it('завершение работы увеличивает счётчик и включает короткий перерыв', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(settings, onComplete));
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.completedPomodoros).toBe(1);
    expect(result.current.stage).toBe('shortBreak');
    expect(result.current.status).toBe('finished');
    expect(onComplete).toHaveBeenCalledWith('work');
  });

  it('после 4 помодоро включает длинный перерыв', () => {
    const { result } = renderHook(() => useTimer(settings));
    for (let i = 0; i < 4; i += 1) {
      act(() => result.current.start());
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      // перерыв завершаем мгновенно, чтобы вернуться к работе
      if (i < 3) {
        act(() => result.current.skip());
      }
    }
    expect(result.current.completedPomodoros).toBe(4);
    expect(result.current.stage).toBe('longBreak');
  });

  it('пропуск этапа не увеличивает счётчик помодоро', () => {
    const { result } = renderHook(() => useTimer(settings));
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    act(() => result.current.skip());
    expect(result.current.completedPomodoros).toBe(0);
    expect(result.current.stage).toBe('shortBreak');
  });

  it('дрейф компенсируется по системному времени', () => {
    const { result } = renderHook(() => useTimer(settings));
    act(() => result.current.start());
    // Прыжок системного времени вперёд имитирует сворачивание вкладки.
    act(() => {
      vi.setSystemTime(new Date('2026-09-30T12:00:30.000Z'));
      vi.advanceTimersByTime(250);
    });
    expect(result.current.remainingSeconds).toBe(30);
  });
});
