'use client';

import { useState } from 'react';

interface ConfirmDialog {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  cancelText?: string;
  confirmText?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmDialog | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openConfirmDialog = (dialogConfig: ConfirmDialog) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsOpen(false);
    setConfig(null);
  };

  const handleConfirm = async () => {
    if (!config) return;

    setIsLoading(true);
    try {
      await config.onConfirm();
    } finally {
      setIsLoading(false);
      closeConfirmDialog();
    }
  };

  return {
    isOpen,
    config,
    isLoading,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
  };
}
