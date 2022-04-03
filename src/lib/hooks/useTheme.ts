import * as nextThemes from 'next-themes';
import { useCallback } from 'react';

export default function useTheme() {
  const { theme, setTheme } = nextThemes.useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return {
    dark: theme === 'dark',
    theme,
    setTheme,
    toggleTheme,
  };
}
