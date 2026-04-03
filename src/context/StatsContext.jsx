import { createContext, useContext, useState } from 'react';

const StatsContext = createContext(null);

export const DEFAULT_STATS = {
  puissance:     0,
  introspection: 0,
  mesure:        0,
  persistance:   0,
};

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('spellPlanificator_stats');
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  function updateStats(newStats) {
    setStats(newStats);
    try { localStorage.setItem('spellPlanificator_stats', JSON.stringify(newStats)); } catch {}
  }

  return (
    <StatsContext.Provider value={{ stats, updateStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  return useContext(StatsContext);
}
