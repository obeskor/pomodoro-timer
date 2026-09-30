import { countToday } from '../lib/stats';
import type { HistoryEntry } from '../types';
import styles from './StatsPanel.module.css';

interface StatsPanelProps {
  history: HistoryEntry[];
  completedPomodoros: number;
}

export function StatsPanel({ history, completedPomodoros }: StatsPanelProps) {
  const todayCount = countToday(history);

  return (
    <section className={styles.panel} aria-labelledby="stats-title">
      <h2 id="stats-title" className={styles.title}>
        Статистика
      </h2>
      <dl className={styles.grid}>
        <div className={styles.item}>
          <dt>Текущая сессия</dt>
          <dd data-testid="session-count">{completedPomodoros}</dd>
        </div>
        <div className={styles.item}>
          <dt>Сегодня</dt>
          <dd data-testid="today-count">{todayCount}</dd>
        </div>
        <div className={styles.item}>
          <dt>Всего</dt>
          <dd data-testid="total-count">{history.length}</dd>
        </div>
      </dl>
    </section>
  );
}
