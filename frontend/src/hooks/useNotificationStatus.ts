import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'edu_read_notifs';

function getStorageKey(scope?: string) {
  return scope ? `${STORAGE_KEY}:${scope}` : STORAGE_KEY;
}

function getStoredIds(storageKey: string): number[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function persistIds(storageKey: string, ids: number[]) {
  localStorage.setItem(storageKey, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('edu_read_notifs_changed'));
}

export function useNotificationStatus(scope?: string) {
  const storageKey = getStorageKey(scope);
  const [readIds, setReadIds] = useState<number[]>(() => getStoredIds(storageKey));

  const syncFromStorage = useCallback(() => {
    setReadIds(getStoredIds(storageKey));
  }, [storageKey]);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener('edu_read_notifs_changed', syncFromStorage);
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
      persistIds(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const markAllAsRead = useCallback((ids: number[]) => {
    setReadIds((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      persistIds(storageKey, next);
      return next;
    });
  }, [storageKey]);

  return { readIds, markAsRead, markAllAsRead };
}
