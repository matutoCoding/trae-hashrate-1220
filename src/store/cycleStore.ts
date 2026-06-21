import { create } from 'zustand';
import type { CycleRule, Cycle } from '@/types';
import { mockCycleRules, mockCycles } from '@/mock';

interface CycleState {
  rules: CycleRule[];
  cycles: Cycle[];
  activeRuleId: string | null;
}

interface CycleActions {
  setRules: (rules: CycleRule[]) => void;
  setCycles: (cycles: Cycle[]) => void;
  addRule: (rule: CycleRule) => void;
  updateRule: (id: string, updates: Partial<CycleRule>) => void;
  deleteRule: (id: string) => void;
  setActiveRule: (id: string) => void;
  addCycle: (cycle: Cycle) => void;
  updateCycle: (id: string, updates: Partial<Cycle>) => void;
  getActiveRule: () => CycleRule | undefined;
  getCycleById: (id: string) => Cycle | undefined;
}

export const useCycleStore = create<CycleState & CycleActions>((set, get) => ({
  rules: mockCycleRules,
  cycles: mockCycles,
  activeRuleId: mockCycleRules[0]?.id || null,

  setRules: (rules) => set({ rules }),
  setCycles: (cycles) => set({ cycles }),

  addRule: (rule) =>
    set((state) => ({ rules: [...state.rules, rule] })),

  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),

  setActiveRule: (id) => set({ activeRuleId: id }),

  addCycle: (cycle) =>
    set((state) => ({ cycles: [...state.cycles, cycle] })),

  updateCycle: (id, updates) =>
    set((state) => ({
      cycles: state.cycles.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  getActiveRule: () => {
    const state = get();
    return state.rules.find((r) => r.id === state.activeRuleId);
  },

  getCycleById: (id) => {
    return get().cycles.find((c) => c.id === id);
  },
}));
