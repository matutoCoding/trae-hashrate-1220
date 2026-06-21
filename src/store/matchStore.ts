import { create } from 'zustand';
import type { MatchResult, MatchDetail } from '@/types';

interface MatchState {
  matchDetails: MatchDetail[];
  matchResultsByCycle: Record<string, MatchResult[]>;
  currentCycleId: string;
  isMatching: boolean;
  matchingProgress: number;
}

interface MatchActions {
  setMatchDetails: (details: MatchDetail[]) => void;
  setCurrentCycleId: (cycleId: string) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setMatchResultsForCycle: (cycleId: string, results: MatchResult[]) => void;
  setIsMatching: (isMatching: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  addMatchResult: (result: MatchResult) => void;
  updateMatchResult: (id: string, updates: Partial<MatchResult>) => void;
  confirmMatch: (id: string) => void;
  rejectMatch: (id: string) => void;
  cancelMatch: (id: string) => void;
  getResultsByStatus: (status: string) => MatchResult[];
  getConfirmedCount: () => number;
  getResultsForCycle: (cycleId: string) => MatchResult[];
  getAllConfirmedResults: () => MatchResult[];
}

export const useMatchStore = create<MatchState & MatchActions>((set, get) => ({
  matchDetails: [],
  matchResultsByCycle: {},
  currentCycleId: '',
  isMatching: false,
  matchingProgress: 0,

  setMatchDetails: (details) => set({ matchDetails: details }),

  setCurrentCycleId: (cycleId) => set({ currentCycleId: cycleId }),

  setMatchResults: (results) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: results,
      },
    })),

  setMatchResultsForCycle: (cycleId, results) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [cycleId]: results,
      },
    })),

  setIsMatching: (isMatching) => set({ isMatching }),
  setMatchingProgress: (matchingProgress) => set({ matchingProgress }),

  addMatchResult: (result) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: [
          ...(state.matchResultsByCycle[state.currentCycleId] || []),
          result,
        ],
      },
    })),

  updateMatchResult: (id, updates) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, ...updates } : r)),
      },
    })),

  confirmMatch: (id) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r)),
      },
    })),

  rejectMatch: (id) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
      },
    })),

  cancelMatch: (id) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
      },
    })),

  getResultsByStatus: (status) => {
    const results = get().matchResultsByCycle[get().currentCycleId] || [];
    return results.filter((r) => r.status === status);
  },

  getConfirmedCount: () => {
    const results = get().matchResultsByCycle[get().currentCycleId] || [];
    return results.filter((r) => r.status === 'confirmed').length;
  },

  getResultsForCycle: (cycleId) => {
    return get().matchResultsByCycle[cycleId] || [];
  },

  getAllConfirmedResults: () => {
    const allResults = Object.values(get().matchResultsByCycle).flat();
    return allResults.filter((r) => r.status === 'confirmed');
  },
}));
