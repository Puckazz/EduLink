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
    const current = getStoredIds(storageKey);
    if (current.includes(id)) return;
    const next = [...current, id];
    persistIds(storageKey, next);
    setReadIds(next);
  }, [storageKey]);

  const markAllAsRead = useCallback((ids: number[]) => {
    const current = getStoredIds(storageKey);
    const next = Array.from(new Set([...current, ...ids]));
    persistIds(storageKey, next);
    setReadIds(next);
  }, [storageKey]);

  return { readIds, markAsRead, markAllAsRead };
}
