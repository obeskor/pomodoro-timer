import { MAX_SETTING, MIN_SETTING, type Settings } from '../types';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onReset: () => void;
}

const FIELDS: { key: keyof Settings; label: string }[] = [
  { key: 'workMin', label: 'Длительность работы, мин' },
  { key: 'shortBreakMin', label: 'Короткий перерыв, мин' },
  { key: 'longBreakMin', label: 'Длинный перерыв, мин' },
];

export function SettingsPanel({ settings, onChange, onReset }: SettingsPanelProps) {
  const update = (key: keyof Settings, raw: string) => {
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value)) return;
    const clamped = Math.min(MAX_SETTING, Math.max(MIN_SETTING, value));
    if (clamped === settings[key]) return;
    onChange({ ...settings, [key]: clamped });
  };

  return (
    <section className={styles.panel} aria-labelledby="settings-title">
      <h2 id="settings-title" className={styles.title}>
        Настройки
      </h2>
      <div className={styles.fields}>
        {FIELDS.map(({ key, label }) => (
          <label key={key} className={styles.field}>
            <span>{label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_SETTING}
              max={MAX_SETTING}
              value={settings[key]}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.reset} onClick={onReset}>
          Сбросить настройки
        </button>
        <p className={styles.note}>
          Изменения сохраняются автоматически и применяются после перезагрузки.
        </p>
      </div>
    </section>
  );
}
