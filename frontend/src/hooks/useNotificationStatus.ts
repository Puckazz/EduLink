import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'edu_read_notifs';

function getStoredIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function persistIds(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('edu_read_notifs_changed'));
}

export function useNotificationStatus() {
  const [readIds, setReadIds] = useState<number[]>(() => getStoredIds());

  const syncFromStorage = useCallback(() => {
    setReadIds(getStoredIds());
  }, []);

  useEffect(() => {
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
