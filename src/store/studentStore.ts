import { create } from 'zustand';
import type { Student, StudentWill } from '@/types';
import { mockStudents } from '@/mock';

interface StudentState {
  students: Student[];
  wills: StudentWill[];
}

interface StudentActions {
  setStudents: (students: Student[]) => void;
  setWills: (wills: StudentWill[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addWill: (will: StudentWill) => void;
  updateWill: (id: string, updates: Partial<StudentWill>) => void;
  setWillByStudent: (studentId: string, will: Omit<StudentWill, 'id' | 'studentId' | 'status' | 'submittedAt'>) => void;
  getWillByStudent: (studentId: string) => StudentWill | undefined;
  getStudentsWithWill: () => Student[];
}

export const useStudentStore = create<StudentState & StudentActions>((set, get) => ({
  students: mockStudents,
  wills: [],

  setStudents: (students) => set({ students }),
  setWills: (wills) => set({ wills }),

  addStudent: (student) =>
    set((state) => ({ students: [...state.students, student] })),

  updateStudent: (id, updates) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  deleteStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
      wills: state.wills.filter((w) => w.studentId !== id),
    })),

  addWill: (will) =>
    set((state) => ({ wills: [...state.wills, will] })),

  updateWill: (id, updates) =>
    set((state) => ({
      wills: state.wills.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  setWillByStudent: (studentId, willData) =>
    set((state) => {
      const existingWill = state.wills.find((w) => w.studentId === studentId);
      if (existingWill) {
        return {
          wills: state.wills.map((w) =>
            w.id === existingWill.id
              ? {
                  ...w,
                  ...willData,
                  submittedAt: new Date().toISOString(),
                }
              : w
          ),
        };
      } else {
        const newWill: StudentWill = {
          id: `will_${Date.now()}`,
          studentId,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          ...willData,
        };
        return {
          wills: [...state.wills, newWill],
        };
      }
    }),

  getWillByStudent: (studentId) => {
    return get().wills.find((w) => w.studentId === studentId);
  },

  getStudentsWithWill: () => {
    const state = get();
    const willStudentIds = new Set(state.wills.map((w) => w.studentId));
    return state.students.filter((s) => willStudentIds.has(s.id));
  },
}));
