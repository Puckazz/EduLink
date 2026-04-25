import { create } from 'zustand';

interface StudentEditModalStore {
  isOpen: boolean;
  studentId: number | null;
  openModal: (studentId: number) => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
}

export const useStudentEditModalStore = create<StudentEditModalStore>(
  (set) => ({
    isOpen: false,
    studentId: null,
    openModal: (studentId) => set({ isOpen: true, studentId }),
    closeModal: () => set({ isOpen: false, studentId: null }),
    setOpen: (open) =>
      set((state) => ({
        isOpen: open,
        studentId: open ? state.studentId : null,
      })),
  }),
);
