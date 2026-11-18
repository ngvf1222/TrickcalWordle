const STATS_KEY = 'wordle_stats';

const DEFAULT_STATS = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
};

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      distribution: { ...DEFAULT_STATS.distribution, ...(parsed.distribution || {}) }
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveGameResult(won, attempts) {
  const stats = loadStats();
  stats.played += 1;

  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    if (attempts >= 1 && attempts <= 6) {
      stats.distribution[attempts] = (stats.distribution[attempts] || 0) + 1;
    }
  } else {
    stats.currentStreak = 0;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }

  return stats;
}
