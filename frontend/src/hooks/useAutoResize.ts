'use client';

import { useEffect } from 'react';

/**
 * Auto-resizes a textarea to fit its content up to maxHeight.
 * Scrollbar is hidden while growing; only appears when maxHeight is reached.
 */
export function useAutoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 120,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset to auto to allow shrinking
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    // Only show scrollbar when content can no longer grow
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
}
