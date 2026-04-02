import { create } from 'zustand';

interface StudentCreateModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
}

export const useStudentCreateModalStore = create<StudentCreateModalStore>(
  (set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
    setOpen: (open) => set({ isOpen: open }),
  }),
);
