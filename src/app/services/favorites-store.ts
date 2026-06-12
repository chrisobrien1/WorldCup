const FAVORITES_KEY = 'wc26.favorites';

/** Anonymous on-device persistence shared by all IWorldCupDataService impls. */
export function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Storage full/unavailable: favorites still work for this session.
  }
}

export function toggledFavorites(current: string[], teamId: string): string[] {
  return current.includes(teamId)
    ? current.filter((id) => id !== teamId)
    : [...current, teamId];
}
