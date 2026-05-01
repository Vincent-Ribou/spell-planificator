import { createContext, useContext, useState, useEffect } from 'react';
import { DARK, LIGHT } from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('spellPlanificator_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  function toggle() {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('spellPlanificator_theme', next ? 'dark' : 'light');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ T: isDark ? DARK : LIGHT, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
