import { formatTime } from '../lib/timer';
import { STAGE_HINTS, STAGE_LABELS } from '../lib/labels';
import type { Stage, TimerStatus } from '../types';
import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  stage: Stage;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
}

const STATUS_LABELS: Record<TimerStatus, string> = {
  idle: 'Готов к запуску',
  running: 'Идёт отсчёт',
  paused: 'Пауза',
  finished: 'Этап завершён',
};

export function TimerDisplay({
  stage,
  status,
  remainingSeconds,
  totalSeconds,
  progress,
}: TimerDisplayProps) {
  const stageLabel = STAGE_LABELS[stage];
  const timeText = formatTime(remainingSeconds);
  const percent = Math.round(progress * 100);

  return (
    <section
      className={`${styles.display} ${stage === 'work' ? styles.work : styles.rest}`}
      aria-label="Текущий этап"
    >
      <p className={styles.stage}>{stageLabel}</p>
      <p
        className={styles.time}
        role="timer"
        aria-live="off"
        aria-label={`Осталось ${remainingSeconds} секунд`}
      >
        {timeText}
      </p>
      <p className={styles.hint}>{STAGE_HINTS[stage]}</p>
      <progress
        className={styles.progress}
        max={totalSeconds || 1}
        value={Math.max(0, totalSeconds - remainingSeconds)}
        aria-label={`Прогресс этапа ${percent} процентов`}
      />
      <p className={styles.status} role="status">
        {STATUS_LABELS[status]}
      </p>
    </section>
  );
}
