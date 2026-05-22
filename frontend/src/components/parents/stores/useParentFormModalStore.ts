import { create } from 'zustand';
import type { Parent } from '@/types/parent';

type ParentFormMode = 'create' | 'edit';

interface ParentFormModalStore {
  isOpen: boolean;
  mode: ParentFormMode;
  editingParent: Parent | null;
  openCreateModal: () => void;
  openEditModal: (parent: Parent) => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
}

export const useParentFormModalStore = create<ParentFormModalStore>((set) => ({
  isOpen: false,
  mode: 'create',
  editingParent: null,
  openCreateModal: () =>
    set({
      isOpen: true,
      mode: 'create',
      editingParent: null,
    }),
  openEditModal: (parent) =>
    set({
      isOpen: true,
      mode: 'edit',
      editingParent: parent,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      editingParent: null,
      mode: 'create',
    }),
  setOpen: (open) =>
    set((state) => ({
      isOpen: open,
      editingParent: open ? state.editingParent : null,
      mode: open ? state.mode : 'create',
    })),
}));
