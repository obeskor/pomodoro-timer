import { useCallback, useEffect, useRef, useState } from 'react';
import { nextStage, stageDurationSeconds } from '../lib/timer';
import type { Settings, Stage, TimerStatus } from '../types';

export interface TimerState {
  stage: Stage;
  status: TimerStatus;
  remainingSeconds: number;
  completedPomodoros: number;
}

interface InternalState extends TimerState {
  /** Абсолютное время завершения этапа (мс). null когда таймер не идёт. */
  endAt: number | null;
}

export interface UseTimerResult extends TimerState {
  /** Полная длительность текущего этапа в секундах. */
  totalSeconds: number;
  /** Прогресс этапа от 0 до 1. */
  progress: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
}

const TICK_MS = 250;

/** Оставшиеся секунды до абсолютного момента завершения. */
function secondsUntil(endAt: number): number {
  return Math.max(0, Math.round((endAt - Date.now()) / 1000));
}

/**
 * Таймер помодоро. Источник истины — абсолютное время завершения этапа,
 * поэтому при сворачивании вкладки отсчёт не дрейфует.
 */
export function useTimer(
  settings: Settings,
  onStageComplete?: (finishedStage: Stage) => void,
): UseTimerResult {
  const [state, setState] = useState<InternalState>(() => ({
    stage: 'work',
    status: 'idle',
    remainingSeconds: stageDurationSeconds('work', settings),
    completedPomodoros: 0,
    endAt: null,
  }));

  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  const onCompleteRef = useRef(onStageComplete);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    onCompleteRef.current = onStageComplete;
  }, [onStageComplete]);

  useEffect(() => {
    if (state.status !== 'running') return;

    const finish = () => {
      const current = stateRef.current;
      if (current.status !== 'running') return;
      const completedPomodoros =
        current.stage === 'work'
          ? current.completedPomodoros + 1
          : current.completedPomodoros;
      const stage = nextStage(current.stage, completedPomodoros);
      const total = stageDurationSeconds(stage, settingsRef.current);
      setState((prev) =>
        prev.status === 'running'
          ? {
              ...prev,
              stage,
              status: 'finished',
              endAt: null,
              remainingSeconds: total,
              completedPomodoros,
            }
          : prev,
      );
      onCompleteRef.current?.(current.stage);
    };

    const tick = () => {
      const current = stateRef.current;
      if (current.status !== 'running' || current.endAt === null) return;
      const remaining = secondsUntil(current.endAt);
      if (remaining === 0) {
        finish();
        return;
      }
      setState((prev) =>
        prev.status === 'running' && prev.remainingSeconds !== remaining
          ? { ...prev, remainingSeconds: remaining }
          : prev,
      );
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.status, state.stage, state.endAt, settings]);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'running') return prev;
      const base =
        prev.status === 'idle'
          ? stageDurationSeconds(prev.stage, settingsRef.current)
          : prev.remainingSeconds;
      if (base <= 0) return prev;
      return {
        ...prev,
        status: 'running',
        remainingSeconds: base,
        endAt: Date.now() + base * 1000,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running' || prev.endAt === null) return prev;
      return {
        ...prev,
        status: 'paused',
        endAt: null,
        remainingSeconds: secondsUntil(prev.endAt),
      };
    });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'running' && prev.endAt !== null) {
        return {
          ...prev,
          status: 'paused',
          endAt: null,
          remainingSeconds: secondsUntil(prev.endAt),
        };
      }
      const base =
        prev.status === 'idle'
          ? stageDurationSeconds(prev.stage, settingsRef.current)
          : prev.remainingSeconds;
      if (base <= 0) return prev;
      return {
        ...prev,
        status: 'running',
        remainingSeconds: base,
        endAt: Date.now() + base * 1000,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      endAt: null,
      remainingSeconds: stageDurationSeconds(prev.stage, settingsRef.current),
    }));
  }, []);

  const skip = useCallback(() => {
    setState((prev) => {
      const stage = nextStage(prev.stage, prev.completedPomodoros);
      return {
        ...prev,
        stage,
        status: 'idle',
        endAt: null,
        remainingSeconds: stageDurationSeconds(stage, settingsRef.current),
      };
    });
  }, []);

  const totalSeconds = stageDurationSeconds(state.stage, settings);
  // В режиме ожидания остаток всегда равен актуальной длительности этапа,
  // поэтому изменение настроек сразу отражается на дисплее.
  const remainingSeconds =
    state.status === 'idle' ? totalSeconds : state.remainingSeconds;
  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds))
      : 0;

  return {
    stage: state.stage,
    status: state.status,
    remainingSeconds,
    completedPomodoros: state.completedPomodoros,
    totalSeconds,
    progress,
    start,
    pause,
    toggle,
    reset,
    skip,
  };
}
