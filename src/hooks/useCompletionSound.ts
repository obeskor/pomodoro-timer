import { useCallback, useMemo } from 'react';

/**
 * Короткий звуковой сигнал завершения этапа.
 * Браузерные уведомления не используются (см. ТЗ 2.7).
 */
export function useCompletionSound(): () => void {
  const audioContextCtor = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return (
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    );
  }, []);

  return useCallback(() => {
    if (!audioContextCtor) return;
    try {
      const ctx = new audioContextCtor();
      const now = ctx.currentTime;
      [880, 1174.66].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + index * 0.18;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.18);
      });
      window.setTimeout(() => void ctx.close(), 600);
    } catch {
      // Звук недоступен — завершение этапа всё равно обрабатывается.
    }
  }, [audioContextCtor]);
}
