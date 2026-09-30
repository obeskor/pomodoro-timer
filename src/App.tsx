import { useCallback, useEffect, useState } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { TimerControls } from './components/TimerControls';
import { TimerDisplay } from './components/TimerDisplay';
import { useCompletionSound } from './hooks/useCompletionSound';
import { useTheme } from './hooks/useTheme';
import { useTimer } from './hooks/useTimer';
import {
  DEFAULT_SETTINGS,
  MAX_HISTORY,
  type HistoryEntry,
  type Settings,
  type Stage,
} from './types';
import {
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
} from './lib/storage';
import styles from './App.module.css';

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const { theme, toggleTheme } = useTheme();
  const playSound = useCompletionSound();

  const handleStageComplete = useCallback(
    (finishedStage: Stage) => {
      playSound();
      if (finishedStage === 'work') {
        setHistory((prev) => {
          const entry: HistoryEntry = {
            completedAt: new Date().toISOString(),
            workMinutes: settings.workMin,
          };
          const next = [...prev, entry].slice(-MAX_HISTORY);
          saveHistory(next);
          return next;
        });
      }
    },
    [playSound, settings.workMin],
  );

  const timer = useTimer(settings, handleStageComplete);

  const handleSettingsChange = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  // Глобальный хоткей: пробел/Enter ставит на паузу или запускает таймер.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      if (target?.closest('button')) return;
      event.preventDefault();
      timer.toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [timer]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Помодоро-таймер</h1>
        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label={
            theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'
          }
        >
          {theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
        </button>
      </header>

      <main className={styles.main}>
        <TimerDisplay
          stage={timer.stage}
          status={timer.status}
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.totalSeconds}
          progress={timer.progress}
        />
        <TimerControls
          status={timer.status}
          onToggle={timer.toggle}
          onReset={timer.reset}
          onSkip={timer.skip}
        />
        <StatsPanel
          history={history}
          completedPomodoros={timer.completedPomodoros}
        />
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onReset={resetSettings}
        />
      </main>

      <footer className={styles.footer}>
        <p>
          Пробел или Enter — старт/пауза. Настройки, тема и история хранятся
          локально в браузере.
        </p>
      </footer>
    </div>
  );
}

export default App;
