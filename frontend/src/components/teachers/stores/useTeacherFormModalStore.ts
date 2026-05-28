import { create } from 'zustand';
import type { Teacher } from '@/types/teacher';

type TeacherFormMode = 'create' | 'edit';

interface TeacherFormModalStore {
  isOpen: boolean;
  mode: TeacherFormMode;
  editingTeacher: Teacher | null;
  openCreateModal: () => void;
  openEditModal: (teacher: Teacher) => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
}

export const useTeacherFormModalStore = create<TeacherFormModalStore>(
  (set) => ({
    isOpen: false,
    mode: 'create',
    editingTeacher: null,
    openCreateModal: () =>
      set({
        isOpen: true,
        mode: 'create',
        editingTeacher: null,
      }),
    openEditModal: (teacher) =>
      set({
        isOpen: true,
        mode: 'edit',
        editingTeacher: teacher,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        editingTeacher: null,
        mode: 'create',
      }),
    setOpen: (open) =>
      set((state) => ({
        isOpen: open,
        editingTeacher: open ? state.editingTeacher : null,
        mode: open ? state.mode : 'create',
      })),
  }),
);
