import { create } from 'zustand';

interface StudentStore {
  selectedStudentId: number | null;
  setSelectedStudentId: (id: number | null) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: null,
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}));
