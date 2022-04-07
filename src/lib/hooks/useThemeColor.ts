import { useEffect } from 'react';

import useTheme from './useTheme';

export default function useThemeColor({
  dark,
  light,
}: {
  dark: string;
  light: string;
}) {
  const { dark: isDark } = useTheme();

  useEffect(() => {
    if (!document) {
      return;
    }

    const meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      return;
    }

    meta.setAttribute('content', isDark ? dark : light);
  }, [isDark, dark, light]);
}
