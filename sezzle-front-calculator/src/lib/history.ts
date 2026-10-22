const HISTORY_STORAGE_KEY = 'sezzle_calculator_history';

export function getHistory(): string[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOperationToHistory(operation: string): string[] {
  try {
    const current = getHistory();
    // Prepend to show newest first
    const updated = [operation, ...current.filter((item) => item !== operation)].slice(0, 50);
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    sessionStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
