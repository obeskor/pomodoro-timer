import type { TimerStatus } from '../types';
import styles from './TimerControls.module.css';

interface TimerControlsProps {
  status: TimerStatus;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
}

function primaryLabel(status: TimerStatus): string {
  if (status === 'running') return 'Пауза';
  if (status === 'paused') return 'Продолжить';
  return 'Старт';
}

export function TimerControls({
  status,
  onToggle,
  onReset,
  onSkip,
}: TimerControlsProps) {
  const label = primaryLabel(status);

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={`${styles.button} ${styles.primary}`}
        onClick={onToggle}
        aria-label={label}
      >
        {label}
      </button>
      <button type="button" className={styles.button} onClick={onReset}>
        Сброс
      </button>
      <button type="button" className={styles.button} onClick={onSkip}>
        Пропустить этап
      </button>
    </div>
  );
}
