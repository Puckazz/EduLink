import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'edu_read_notifs';

/** Read current IDs from localStorage */
function getStoredIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

/** Write IDs to localStorage and dispatch a custom event so
 *  other instances of this hook in the same tab also update. */
function persistIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  // Notify other hook instances in the same tab
  window.dispatchEvent(new CustomEvent('edu_read_notifs_changed'));
}

/**
 * Shared notification read-state hook.
 * All component instances (Bell, List page, etc.) stay in sync via:
 *  - localStorage   → persists across page reloads
 *  - CustomEvent    → syncs across same-tab instances immediately
 *  - storage event  → syncs across different tabs
 */
export function useNotificationStatus() {
  const [readIds, setReadIds] = useState<number[]>(() => getStoredIds());

  const syncFromStorage = useCallback(() => {
    setReadIds(getStoredIds());
  }, []);

  useEffect(() => {
    // Same-tab sync (other hook instances dispatch this)
    window.addEventListener('edu_read_notifs_changed', syncFromStorage);
    // Cross-tab sync (browser fires this when another tab writes to localStorage)
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener('edu_read_notifs_changed', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [syncFromStorage]);

  const markAsRead = useCallback((id: number) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persistIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((ids: number[]) => {
    setReadIds((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      persistIds(next);
      return next;
    });
  }, []);

  return { readIds, markAsRead, markAllAsRead };
}
