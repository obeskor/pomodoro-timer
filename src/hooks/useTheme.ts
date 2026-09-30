import { useCallback, useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../lib/storage';
import type { Theme } from '../types';

export interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
}

/** Тема оформления с сохранением в localStorage. */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
